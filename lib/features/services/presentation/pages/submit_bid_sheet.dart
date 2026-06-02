import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:bolt_marketplace/core/themes/app_theme.dart';
import 'package:bolt_marketplace/shared/widgets/app_button.dart';
import 'package:bolt_marketplace/shared/widgets/app_input.dart';
import '../../domain/entities/service_entities.dart';
import '../providers/service_providers.dart';

class SubmitBidSheet extends ConsumerStatefulWidget {
  final String requestId;
  final ServiceRequest request;

  const SubmitBidSheet({
    required this.requestId,
    required this.request,
    super.key,
  });

  @override
  ConsumerState<SubmitBidSheet> createState() => _SubmitBidSheetState();
}

class _SubmitBidSheetState extends ConsumerState<SubmitBidSheet> {
  final _formKey = GlobalKey<FormState>();
  final _priceController = TextEditingController();
  final _messageController = TextEditingController();
  String? _vehicleType;
  bool _isSubmitting = false;

  @override
  void dispose() {
    _priceController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  Future<void> _submitBid() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      await ref.read(
        submitBidProvider(
          (
            requestId: widget.requestId,
            price: double.parse(_priceController.text.trim()),
            message: _messageController.text.trim().isNotEmpty ? _messageController.text.trim() : null,
            vehicleType: widget.request.type == ServiceType.ride ? _vehicleType : null,
          ),
        ).future,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Bid submitted successfully!')),
        );
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        bottom: MediaQuery.of(context).viewInsets.bottom,
        left: 16,
        right: 16,
        top: 16,
      ),
      child: SingleChildScrollView(
        child: Form(
          key: _formKey,
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Submit Your Bid', style: AppTextStyles.h2),
              const SizedBox(height: 16),
              // Request summary
              Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(widget.request.title, style: AppTextStyles.h2),
                    const SizedBox(height: 4),
                    Text(
                      'Budget: ${widget.request.price?.toStringAsFixed(2) ?? 'Not specified'}',
                      style: const TextStyle(fontSize: 12),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              // Your price
              AppInput(
                label: 'Your Price Offer',
                controller: _priceController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (v) {
                  if (v?.isEmpty ?? true) return 'Enter your price';
                  if (double.tryParse(v!) == null) return 'Enter valid price';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              // Vehicle type (for rides only)
              if (widget.request.type == ServiceType.ride) ...[
                DropdownButtonFormField<String>(
                  value: _vehicleType,
                  decoration: const InputDecoration(labelText: 'Vehicle Type'),
                  items: const [
                    DropdownMenuItem(value: 'economy', child: Text('Economy Car')),
                    DropdownMenuItem(value: 'premium', child: Text('Premium Car')),
                    DropdownMenuItem(value: 'suv', child: Text('SUV')),
                    DropdownMenuItem(value: 'van', child: Text('Van')),
                  ],
                  onChanged: (value) {
                    if (value != null) {
                      setState(() => _vehicleType = value);
                    }
                  },
                  validator: (v) => v == null ? 'Select vehicle type' : null,
                ),
                const SizedBox(height: 12),
              ],
              // Message
              AppInput(
                label: 'Add a Message (optional)',
                controller: _messageController,
                maxLines: 3,
              ),
              const SizedBox(height: 24),
              AppButton(
                label: _isSubmitting ? 'Submitting...' : 'Submit Bid',
                onPressed: _isSubmitting ? null : _submitBid,
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }
}
