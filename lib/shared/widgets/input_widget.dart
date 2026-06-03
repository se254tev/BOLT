import 'package:flutter/material.dart';

class AppInput extends StatelessWidget {
  final String? label;
  final TextEditingController? controller;
  final bool obscure;
  final String? Function(String?)? validator;
  final TextInputType? keyboardType;
  final int? maxLines;
  final int? minLines;
  final ValueChanged<String>? onChanged;
  final bool enabled;
  final String? hintText;

  const AppInput({
    super.key,
    this.label,
    this.controller,
    this.obscure = false,
    this.validator,
    this.keyboardType,
    this.maxLines = 1,
    this.minLines,
    this.onChanged,
    this.enabled = true,
    this.hintText,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) Padding(
          padding: const EdgeInsets.only(bottom: 8),
          child: Text(label!, style: Theme.of(context).textTheme.bodySmall),
        ),
        TextFormField(
          controller: controller,
          obscureText: obscure,
          validator: validator,
          keyboardType: keyboardType,
          maxLines: obscure ? 1 : maxLines,
          minLines: minLines,
          onChanged: onChanged,
          enabled: enabled,
          decoration: InputDecoration(
            hintText: hintText,
            filled: true,
            fillColor: enabled ? Theme.of(context).cardColor : Theme.of(context).cardColor.withValues(alpha: 0.5),
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(8),
              borderSide: BorderSide.none,
            ),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
          ),
        ),
      ],
    );
  }
}
