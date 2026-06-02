import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:bolt_marketplace/shared/widgets/app_button.dart';
import 'package:bolt_marketplace/features/cart/presentation/providers/checkout_provider.dart';

class CheckoutShippingPage extends ConsumerStatefulWidget {
  const CheckoutShippingPage({super.key});

  @override
  ConsumerState<CheckoutShippingPage> createState() => _CheckoutShippingPageState();
}

class _CheckoutShippingPageState extends ConsumerState<CheckoutShippingPage> {
  final _fullNameController = TextEditingController();
  final _addressController = TextEditingController();
  final _cityController = TextEditingController();
  final _postalCodeController = TextEditingController();
  final _phoneController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    final checkoutInfo = ref.read(checkoutInfoProvider);
    _fullNameController.text = checkoutInfo.fullName;
    _addressController.text = checkoutInfo.address;
    _cityController.text = checkoutInfo.city;
    _postalCodeController.text = checkoutInfo.postalCode;
    _phoneController.text = checkoutInfo.phone;
  }

  void _saveAndContinue() {
    if (!_formKey.currentState!.validate()) return;
    ref.read(checkoutInfoProvider.notifier).state = ref.read(checkoutInfoProvider).copyWith(
          fullName: _fullNameController.text.trim(),
          address: _addressController.text.trim(),
          city: _cityController.text.trim(),
          postalCode: _postalCodeController.text.trim(),
          phone: _phoneController.text.trim(),
        );
    context.go('/checkout/payment');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Shipping Information')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Form(
          key: _formKey,
          child: ListView(
            children: [
              TextFormField(
                controller: _fullNameController,
                decoration: const InputDecoration(labelText: 'Full Name'),
                validator: (value) => value == null || value.isEmpty ? 'Enter your full name' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _addressController,
                decoration: const InputDecoration(labelText: 'Shipping Address'),
                validator: (value) => value == null || value.isEmpty ? 'Enter your address' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _cityController,
                decoration: const InputDecoration(labelText: 'City'),
                validator: (value) => value == null || value.isEmpty ? 'Enter your city' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _postalCodeController,
                decoration: const InputDecoration(labelText: 'Postal Code'),
                validator: (value) => value == null || value.isEmpty ? 'Enter postal code' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _phoneController,
                decoration: const InputDecoration(labelText: 'Phone Number'),
                keyboardType: TextInputType.phone,
                validator: (value) => value == null || value.isEmpty ? 'Enter your phone number' : null,
              ),
              const SizedBox(height: 24),
              AppButton(label: 'Continue to Payment', onPressed: _saveAndContinue),
            ],
          ),
        ),
      ),
    );
  }
}
