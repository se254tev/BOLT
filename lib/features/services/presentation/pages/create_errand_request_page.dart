import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:bolt_marketplace/core/themes/app_theme.dart';
import 'package:bolt_marketplace/shared/widgets/app_button.dart';
import 'package:bolt_marketplace/shared/widgets/app_input.dart';
import '../providers/service_providers.dart';

class CreateErrandRequestPage extends ConsumerStatefulWidget {
  const CreateErrandRequestPage({super.key});

  @override
  ConsumerState<CreateErrandRequestPage> createState() => _CreateErrandRequestPageState();
}

class _CreateErrandRequestPageState extends ConsumerState<CreateErrandRequestPage> {
  final _formKey = GlobalKey<FormState>();
  final _titleController = TextEditingController();
  final _descriptionController = TextEditingController();
  final _priceController = TextEditingController();
  final _locationController = TextEditingController();
  String _selectedCategory = 'shopping';

  bool _isSubmitting = false;

  @override
  void dispose() {
    _titleController.dispose();
    _descriptionController.dispose();
    _priceController.dispose();
    _locationController.dispose();
    super.dispose();
  }

  Future<void> _submitRequest() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSubmitting = true);

    try {
      final result = await ref.read(
        createErrandRequestProvider(
          (
            title: _titleController.text.trim(),
            description: _descriptionController.text.trim(),
            location: {'address': _locationController.text.trim()},
            estimatedPrice: double.parse(_priceController.text.trim()),
            category: _selectedCategory,
          ),
        ).future,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Errand request created successfully!')),
        );
        context.go('/services/errands/bids/${result.id}');
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
      appBar: AppBar(title: const Text('Request an Errand')),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              const Text('Errand Details', style: AppTextStyles.h2),
              const SizedBox(height: 16),
              AppInput(
                label: 'Errand Title',
                controller: _titleController,
                validator: (v) => v?.isEmpty ?? true ? 'Enter errand title' : null,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                initialValue: _selectedCategory,
                decoration: const InputDecoration(labelText: 'Category'),
                items: const [
                  DropdownMenuItem(value: 'shopping', child: Text('Shopping')),
                  DropdownMenuItem(value: 'delivery', child: Text('Delivery')),
                  DropdownMenuItem(value: 'document', child: Text('Document Handling')),
                  DropdownMenuItem(value: 'other', child: Text('Other')),
                ],
                onChanged: (value) {
                  if (value != null) {
                    setState(() => _selectedCategory = value);
                  }
                },
              ),
              const SizedBox(height: 12),
              AppInput(
                label: 'Location',
                controller: _locationController,
                validator: (v) => v?.isEmpty ?? true ? 'Enter location' : null,
              ),
              const SizedBox(height: 12),
              AppInput(
                label: 'Estimated Budget (currency)',
                controller: _priceController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                validator: (v) {
                  if (v?.isEmpty ?? true) return 'Enter estimated budget';
                  if (double.tryParse(v!) == null) return 'Enter valid amount';
                  return null;
                },
              ),
              const SizedBox(height: 12),
              AppInput(
                label: 'Detailed Instructions',
                controller: _descriptionController,
                maxLines: 4,
                validator: (v) => v?.isEmpty ?? true ? 'Provide details' : null,
              ),
              const SizedBox(height: 24),
              AppButton(
                label: _isSubmitting ? 'Creating...' : 'Request Errand',
                onPressed: _isSubmitting ? null : _submitRequest,
              ),
            ],
          ),
        ),
      ),
    );
  }
}
