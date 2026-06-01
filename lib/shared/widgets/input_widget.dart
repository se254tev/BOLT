import 'package:flutter/material.dart';

class AppInput extends StatelessWidget {
  final String? label;
  final TextEditingController? controller;
  final bool obscure;

  const AppInput({super.key, this.label, this.controller, this.obscure = false});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (label != null) Padding(padding: const EdgeInsets.only(bottom: 8), child: Text(label!, style: Theme.of(context).textTheme.bodySmall)),
        TextField(
          controller: controller,
          obscureText: obscure,
          decoration: InputDecoration(
            filled: true,
            fillColor: Theme.of(context).cardColor,
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: BorderSide.none),
            contentPadding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
          ),
        ),
      ],
    );
  }
}
