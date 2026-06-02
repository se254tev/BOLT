class PhoneSanitizer {
  /// Normalize phone numbers.
  /// Returns a string preserving a leading '+' if present and digits only,
  /// or null if the resulting number is too short.
  static String? normalize(String? phone) {
    if (phone == null) return null;
    var trimmed = phone.trim();
    if (trimmed.isEmpty) return null;

    final hasPlus = trimmed.startsWith('+');
    // keep digits only
    final digits = trimmed.replaceAll(RegExp(r'[^0-9]'), '');
    if (digits.length < 7) return null; // too short to be valid
    return hasPlus ? '+$digits' : digits;
  }
}
