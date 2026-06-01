import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';
import '../../../../shared/widgets/button_widget.dart';
import '../providers/checkout_provider.dart';
import '../../../../core/providers.dart';

class CheckoutPaymentPage extends ConsumerStatefulWidget {
  const CheckoutPaymentPage({super.key});

  @override
  ConsumerState<CheckoutPaymentPage> createState() => _CheckoutPaymentPageState();
}

class _CheckoutPaymentPageState extends ConsumerState<CheckoutPaymentPage> {
  bool _loading = true;
  bool _uploading = false;
  Map<String, dynamic>? _paymentMethods;
  final _transactionController = TextEditingController();
  final _messageController = TextEditingController();
  File? _selectedImage;
  String? _screenshotUrl;
  String? _uploadError;

  @override
  void initState() {
    super.initState();
    _loadSellerPaymentMethods();
  }

  @override
  void dispose() {
    _transactionController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _loadSellerPaymentMethods() async {
    try {
      final cartState = ref.read(cartControllerProvider);
      final cart = cartState is AsyncData ? cartState.value : null;
      if (cart == null || cart.items.isEmpty) {
        setState(() { _loading = false; });
        return;
      }

      final firstProductId = cart.items.first.productId;
      final productRemote = ref.read(productRemoteDataSourceProvider);
      final product = await productRemote.getProductById(firstProductId);
      final sellerId = product.sellerId;

      final dio = ref.read(dioClientProvider).dio;
      final resp = await dio.get('/api/sellers/$sellerId/payment-methods');
      setState(() {
        _paymentMethods = resp.data['paymentMethods'] as Map<String, dynamic>?;
      });
    } catch (e) {
      // ignore: avoid_print
      print('Failed to load payment methods: $e');
    } finally {
      setState(() { _loading = false; });
    }
  }

  Future<void> _pickImage() async {
    try {
      final picker = ImagePicker();
      final pickedFile = await picker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (pickedFile != null) {
        setState(() {
          _selectedImage = File(pickedFile.path);
          _uploadError = null;
        });
      }
    } catch (e) {
      setState(() {
        _uploadError = 'Failed to pick image: $e';
      });
    }
  }

  Future<void> _uploadScreenshot() async {
    if (_selectedImage == null) {
      setState(() {
        _uploadError = 'Please select an image first';
      });
      return;
    }

    setState(() {
      _uploading = true;
      _uploadError = null;
    });

    try {
      final dio = ref.read(dioClientProvider).dio;
      final formData = FormData.fromMap({
        'image': await MultipartFile.fromFile(
          _selectedImage!.path,
          filename: 'payment_proof_${DateTime.now().millisecondsSinceEpoch}.jpg',
        ),
      });

      final resp = await dio.post('/api/uploads/payment-proof', data: formData);

      if (resp.statusCode == 200) {
        setState(() {
          _screenshotUrl = resp.data['url'] as String?;
          _uploading = false;
        });
      } else {
        setState(() {
          _uploadError = 'Upload failed: ${resp.statusMessage}';
          _uploading = false;
        });
      }
    } catch (e) {
      setState(() {
        _uploadError = 'Upload error: $e';
        _uploading = false;
      });
    }
  }

  Future<void> _submitProof() async {
    if (_transactionController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please enter transaction code')),
      );
      return;
    }

    if (_screenshotUrl == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please upload payment proof screenshot')),
      );
      return;
    }

    try {
      final cartState = ref.read(cartControllerProvider);
      final cart = cartState is AsyncData ? cartState.value : null;
      if (cart == null) return;
      final orderId = cart.id;
      final dio = ref.read(dioClientProvider).dio;

      final payload = {
        'transactionCode': _transactionController.text.trim(),
        'mpesaMessage': _messageController.text.trim(),
        'screenshotUrl': _screenshotUrl,
      };

      final resp = await dio.post('/api/orders/$orderId/payment-proof', data: payload);
      if (resp.statusCode == 200) {
        if (mounted) {
          context.go('/checkout/submitted');
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Failed to submit proof: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Payment Proof')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: _loading
            ? const Center(child: CircularProgressIndicator())
            : SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Seller Payment Methods',
                      style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    if (_paymentMethods != null) ...[
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          border: Border.all(color: Colors.grey.shade300),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            if (_paymentMethods!['mpesaPhone'] != null)
                              Text('📱 M-Pesa Phone: ${_paymentMethods!['mpesaPhone']}'),
                            if (_paymentMethods!['mpesaTill'] != null)
                              Text('🏪 M-Pesa Till: ${_paymentMethods!['mpesaTill']}'),
                            if (_paymentMethods!['mpesaPaybill'] != null)
                              Text('💳 M-Pesa Paybill: ${_paymentMethods!['mpesaPaybill']}'),
                            if (_paymentMethods!['bankName'] != null)
                              Text('🏦 Bank: ${_paymentMethods!['bankName']} ${_paymentMethods!['bankAccountNumber'] ?? ''}'),
                          ],
                        ),
                      ),
                      const SizedBox(height: 16),
                    ] else
                      const Text('No payment methods provided by seller.'),
                    const SizedBox(height: 24),
                    const Text(
                      'Payment Proof',
                      style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 12),
                    const Text(
                      'After paying the seller, upload a screenshot of the payment confirmation.',
                      style: TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                    const SizedBox(height: 16),
                    // Screenshot preview
                    if (_selectedImage != null || _screenshotUrl != null)
                      Column(
                        children: [
                          Container(
                            width: double.infinity,
                            height: 200,
                            decoration: BoxDecoration(
                              border: Border.all(color: Colors.grey.shade300),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: _selectedImage != null
                                ? Image.file(_selectedImage!, fit: BoxFit.cover)
                                : const Center(child: CircularProgressIndicator()),
                          ),
                          const SizedBox(height: 12),
                          if (_screenshotUrl != null)
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: Colors.green.shade50,
                                border: Border.all(color: Colors.green.shade300),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: const Row(
                                children: [
                                  Icon(Icons.check_circle, color: Colors.green, size: 20),
                                  SizedBox(width: 8),
                                  Expanded(child: Text('Screenshot uploaded successfully')),
                                ],
                              ),
                            ),
                          const SizedBox(height: 12),
                        ],
                      ),
                    // Upload button
                    if (_screenshotUrl == null)
                      AppButton(
                        label: _uploading ? 'Uploading...' : 'Pick & Upload Screenshot',
                        onPressed: _uploading ? null : () async {
                          await _pickImage();
                          if (_selectedImage != null && mounted) {
                            await _uploadScreenshot();
                          }
                        },
                      ),
                    if (_uploadError != null) ...[
                      const SizedBox(height: 12),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: Colors.red.shade50,
                          border: Border.all(color: Colors.red.shade300),
                          borderRadius: BorderRadius.circular(4),
                        ),
                        child: Row(
                          children: [
                            Icon(Icons.error, color: Colors.red.shade700, size: 20),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _uploadError!,
                                style: TextStyle(color: Colors.red.shade700),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                    const SizedBox(height: 16),
                    // Transaction details
                    AppInput(label: 'Transaction Code', controller: _transactionController),
                    const SizedBox(height: 8),
                    AppInput(label: 'M-Pesa Message (optional)', controller: _messageController),
                    const SizedBox(height: 24),
                    AppButton(
                      label: 'Submit Payment Proof',
                      onPressed: _screenshotUrl == null ? null : _submitProof,
                    ),
                    const SizedBox(height: 24),
                  ],
                ),
              ),
      ),
    );
  }
}

