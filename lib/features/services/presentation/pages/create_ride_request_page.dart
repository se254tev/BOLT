import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:bolt_marketplace/core/themes/app_theme.dart';
import 'package:bolt_marketplace/shared/widgets/app_button.dart';
import 'package:bolt_marketplace/shared/widgets/app_input.dart';
import '../../domain/entities/service_entities.dart';
import '../providers/service_providers.dart';

class CreateRideRequestPage extends ConsumerStatefulWidget {
  const CreateRideRequestPage({super.key});

  @override
  ConsumerState<CreateRideRequestPage> createState() => _CreateRideRequestPageState();
}

class _CreateRideRequestPageState extends ConsumerState<CreateRideRequestPage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController(text: 'Ride Request');
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _pickupController = TextEditingController();
  final _dropoffController = TextEditingController();

  bool _isSubmitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _pickupController.dispose();
    _dropoffController.dispose();
    super.dispose();
  }

  Future<void> _submitRequest() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      final result = await ref.read(
        createRideRequestProvider(
          (
            title: _titleController.text.trim(),
            description: _descriptionController.text.trim(),
            pickupLocation: {'address': _pickupController.text.trim()},
            dropoffLocation: {'address': _dropoffController.text.trim()},
            estimatedPrice: double.parse(_priceController.text.trim()),
          ),
        ).future,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Ride request created successfully!')),
        );
        context.go('/services/rides/bids/${result.id}');
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
    return Scaffold(
      appBar: AppBar(title: const Text('Request a Ride')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Ride Details', style: AppTextStyles.h2),
              const SizedBox(height: 16),
              AppInput(
                label: 'Pickup Location',
                controller: _pickupController,
                validator: (v) => v?.isEmpty ?? true ? 'Enter pickup location' : null,
              ),
              const SizedBox(height: 12),
              AppInput(
                label: 'Dropoff Location',
                controller: _dropoffController,
                validator: (v) => v?.isEmpty ?? true ? 'Enter dropoff location' : null,
              ),
              const SizedBox(height: 12),
              AppInput(
                label: 'Estimated Price (currency)',
                controller: _priceController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (v) {
                  if (v?.isEmpty ?? true) return 'Enter estimated price';
                  if (double.tryParse(v!) == null) return 'Enter valid price';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              AppInput(
                label: 'Additional Details (optional)',
                controller: _descriptionController,
                maxLines: 3,
              ),
              const SizedBox(height: 24),
              AppButton(
                label: _isSubmitting ? 'Creating...' : 'Create Ride Request',
                onPressed: _isSubmitting ? null : _submitRequest,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
