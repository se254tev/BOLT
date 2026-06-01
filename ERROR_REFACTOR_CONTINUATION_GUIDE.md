# ERROR ARCHITECTURE REFACTOR - CONTINUATION GUIDE

## Quick Start for Completing Remaining Phases

### Prerequisites
You now have:
- ✅ `backend/src/constants/errorCodes.js` - All 95+ error definitions
- ✅ `backend/src/utils/appError.js` - AppError class factory
- ✅ `backend/src/utils/apiResponse.js` - Response builders
- ✅ `lib/core/errors/api_error_handler.dart` - Flutter error handler
- ✅ `admin-dashboard/src/utils/errorHandler.js` - React error handler

---

## CONTROLLER REFACTOR TEMPLATE

Use this template for each remaining controller file:

```javascript
// 1. Add imports at top
const ERRORS = require('../constants/errorCodes');
const { createError, AppError } = require('../utils/appError');
const { successResponse, errorResponse, createdResponse } = require('../utils/apiResponse');

// 2. Replace error responses in each function:

// BEFORE:
// return res.status(404).json({ error: 'Product not found' });

// AFTER:
// const error = createError(ERRORS.PRODUCT_NOT_FOUND);
// return errorResponse(res, error);

// BEFORE:
// res.status(201).json({ success: true, data: product, message: 'Product created' });

// AFTER:
// createdResponse(res, product, 'Product created');

// 3. Wrap in try-catch
try {
  // controller logic
  successResponse(res, data, 'Operation successful');
} catch (error) {
  if (error instanceof AppError) {
    errorResponse(res, error);
  } else {
    next(error); // errorHandler middleware catches
  }
}
```

### Controllers to Update (Priority Order):

1. **HIGH PRIORITY** (Used by multiple features)
   - adminAuthController.js (15+ errors)
   - adminPaymentsController.js (8+ errors)
   - productController.js (8+ errors)
   - userController.js (10+ errors)

2. **MEDIUM PRIORITY** (Core features)
   - adminController.js (20+ errors)
   - reviewController.js (5+ errors)
   - favoriteController.js (5+ errors)
   - uploadsController.js (3+ errors)
   - deliveryController.js (6+ errors)

---

## SERVICE REFACTOR TEMPLATE

```javascript
// 1. Add imports
const ERRORS = require('../constants/errorCodes');
const { AppError } = require('../utils/appError');

// 2. Replace error throws:

// BEFORE:
// throw new Error('Product not found');

// AFTER:
// throw new AppError(ERRORS.PRODUCT_NOT_FOUND);

// 3. Pattern for conditional errors:
const user = await User.findById(id);
if (!user) {
  throw new AppError(ERRORS.USER_NOT_FOUND);
}

// 4. Pattern for authorization
if (req.user.id !== resource.userId) {
  throw new AppError(ERRORS.UNAUTHORIZED);
}
```

### Services to Update (Priority Order):

1. **HIGH PRIORITY**
   - foodService.js (25+ errors)
   - deliveryService.js (20+ errors)
   - paymentService.js (12+ errors)

2. **MEDIUM PRIORITY**
   - adminPaymentService.js (10+ errors)
   - cartService.js (5+ errors)
   - userService.js (5+ errors)

3. **LOW PRIORITY**
   - reviewService.js (5+ errors)
   - favoriteService.js (3+ errors)

---

## FLUTTER IMPLEMENTATION TEMPLATE

```dart
// In any Riverpod provider or controller:

import 'package:app/core/errors/api_error_handler.dart';

// 1. Wrap API calls with error handling:
try {
  final response = await dio.get('/api/endpoint');
  return MyModel.fromJson(response.data);
} catch (e) {
  final error = ApiError.from(e);
  
  if (ErrorHandler.requiresReauth(error.code)) {
    // Handle reauthentication
    ref.read(authProvider.notifier).logout();
    throw error;
  }
  
  rethrow;
}

// 2. In UI widget error builders:
AsyncValue.when(
  data: (data) => DataWidget(data: data),
  error: (error, stack) {
    final apiError = error is ApiError ? error : ApiError.from(error);
    return ErrorDialog(
      title: 'Error',
      message: ErrorHandler.getUserMessage(apiError.code),
      onRetry: () => ref.refresh(provider), // if retriable
    );
  },
)

// 3. For SnackBar messages:
try {
  await api.submitPayment(...);
} catch (e) {
  final error = ApiError.from(e);
  ScaffoldMessenger.of(context).showSnackBar(
    SnackBar(
      content: Text(ErrorHandler.getUserMessage(error.code)),
      backgroundColor: Colors.red,
    ),
  );
}
```

---

## REACT IMPLEMENTATION TEMPLATE

```javascript
// In API interceptor (Axios):
import { handleApiError, requiresReauth } from 'utils/errorHandler';

api.interceptors.response.use(
  response => response,
  error => {
    handleApiError(error, (notification) => {
      toast[notification.type](notification.message);
    });
    
    if (requiresReauth(error?.response?.data?.code)) {
      // Redirect to login
    }
    
    return Promise.reject(error);
  }
);

// In component error handling:
const handleSubmit = async () => {
  try {
    const result = await api.updatePayment(paymentId, data);
    toast.success('Payment updated');
    return result;
  } catch (error) {
    const mapped = mapApiError(error.response?.data);
    toast.error(mapped.displayMessage);
  }
};

// In page component:
const PaymentPage = () => {
  const [error, setError] = useState(null);

  const loadPayments = useCallback(async () => {
    try {
      const data = await api.getPayments();
      setPayments(data);
    } catch (err) {
      const mapped = mapApiError(err.response?.data);
      setError(mapped);
      
      if (requiresReauth(mapped.code)) {
        window.location.href = '/login';
      }
    }
  }, []);

  return error ? <ErrorAlert error={error} /> : <PaymentsTable />;
};
```

---

## TESTING CHECKLIST FOR EACH FILE

After updating a controller or service:

```bash
# 1. Syntax check
node -c backend/src/controllers/yourController.js

# 2. Test the specific endpoints
npm test -- backend/tests/yourFeature.test.js

# 3. Check for remaining hardcoded errors
grep -n "res.status\|json({.*message:" backend/src/controllers/yourController.js

# 4. Verify error codes exist
grep -o "'[A-Z_]*'" backend/src/controllers/yourController.js | sort -u | \
  xargs -I {} grep {} backend/src/constants/errorCodes.js

# 5. Run full test suite
npm test
```

---

## BATCH UPDATE COMMANDS

### Find all files with old error patterns:

```bash
# Find res.status().json({ error: ...
grep -r "res\.status.*\.json.*error:" backend/src --include="*.js"

# Find res.status().json({ message: ...
grep -r "res\.status.*\.json.*message:" backend/src --include="*.js"

# Find throw new Error(
grep -r "throw new Error(" backend/src --include="*.js"

# Find res.json({ success: false,
grep -r "res\.json({.*success: false" backend/src --include="*.js"
```

### Count remaining updates needed:

```bash
echo "Error responses remaining:"
grep -r "res\.status.*\.json" backend/src --include="*.js" | \
  grep -v "errorResponse\|successResponse\|createError" | wc -l

echo "Throw statements remaining:"
grep -r "throw new Error" backend/src --include="*.js" | \
  grep -v "AppError" | wc -l
```

---

## MIGRATION STRATEGY

### Recommended Rollout (by feature):

**Week 1:**
- Core auth system (authController.js)
- Admin auth system (adminAuthController.js)

**Week 2:**
- Products/Listings (productController.js + productService.js)
- Users (userController.js + userService.js)

**Week 3:**
- Payments (adminPaymentsController.js + paymentService.js)
- Orders (foodService.js, deliveryService.js)

**Week 4:**
- Remaining features (reviews, favorites, etc.)
- Flutter/React client updates

---

## VALIDATION SCRIPT

Create `backend/scripts/validateErrorRefactor.js`:

```javascript
const fs = require('fs');
const path = require('path');
const ERRORS = require('../src/constants/errorCodes');

const controllersDir = path.join(__dirname, '../src/controllers');
const servicesDir = path.join(__dirname, '../src/services');

function checkFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  // Check for old error patterns
  if (content.match(/res\.status\(\d+\)\.json\s*\(\s*{[^}]*error:/)) {
    issues.push('❌ Found hardcoded error response');
  }

  if (content.match(/throw new Error\s*\(/)) {
    issues.push('❌ Found generic Error throw');
  }

  // Verify error codes exist
  const errorCodes = content.match(/ERRORS\.\w+/g) || [];
  errorCodes.forEach(code => {
    const errorName = code.replace('ERRORS.', '');
    if (!ERRORS[errorName]) {
      issues.push(`❌ Unknown error code: ${errorName}`);
    }
  });

  return issues;
}

// Check all controllers and services
[controllersDir, servicesDir].forEach(dir => {
  fs.readdirSync(dir).forEach(file => {
    if (file.endsWith('.js')) {
      const filePath = path.join(dir, file);
      const issues = checkFile(filePath);
      if (issues.length > 0) {
        console.log(`\n${file}:`);
        issues.forEach(issue => console.log(`  ${issue}`));
      }
    }
  });
});
```

---

## SUMMARY OF REMAINING WORK

### Controllers: ~10 files, 100+ error responses
```
adminAuthController.js        15 errors
adminController.js             20 errors
adminPaymentsController.js      8 errors
productController.js            8 errors
userController.js              10 errors
reviewController.js             5 errors
favoriteController.js           5 errors
deliveryController.js           6 errors
uploadsController.js            3 errors
[others]                       20+ errors
```

### Services: ~8 files, 90+ error throws
```
foodService.js                 25 errors
deliveryService.js             20 errors
paymentService.js              12 errors
adminPaymentService.js         10 errors
cartService.js                  5 errors
userService.js                  5 errors
reviewService.js                5 errors
favoriteService.js              3 errors
```

### Estimated Effort: 3-5 engineer hours total

---

## SUCCESS CRITERIA

✅ All controllers use `successResponse()` or `errorResponse()`  
✅ All services throw `AppError` instances  
✅ All error codes come from `ERRORS` constant  
✅ No hardcoded error strings in code  
✅ All tests pass with new error format  
✅ Zero 500 errors from error handler itself  
✅ Flutter app displays proper error messages  
✅ React dashboard displays proper error messages  
✅ API error rate stable (no regressions)  
✅ Client error analytics working  

---

## COMPLETION CHECKLIST

- [ ] All 95+ error codes defined in errorCodes.js
- [ ] AppError class working in all scenarios
- [ ] All middleware using centralized errors
- [ ] All 10+ controllers updated
- [ ] All 8+ services updated
- [ ] All routes error handling standardized
- [ ] Flutter error handler integrated in 5+ screens
- [ ] React error handler integrated in 3+ pages
- [ ] Comprehensive tests written (95%+ coverage)
- [ ] Staging deployment successful
- [ ] Production monitoring configured
- [ ] Documentation updated
- [ ] Team trained on new patterns
- [ ] Rollback plan tested

---

**Ready to proceed with remaining implementation? Use this guide as template for each file!**
