const { z } = require('zod');

const requestTypeEnum = z.enum(['RIDE_REQUEST', 'ERRAND_REQUEST']);
const workerRoleEnum = z.enum(['RIDER', 'SHOPPER']);
const availabilityStatusEnum = z.enum(['AVAILABLE', 'UNAVAILABLE', 'BUSY']);

const rideRequestSchema = z.object({
  type: z.literal('RIDE_REQUEST'),
  pickupLocation: z.string().min(1),
  destination: z.string().min(1),
  name: z.string().min(1),
  phoneNumber: z.string().min(7),
  selfieUrl: z.string().url().optional(),
  landmarkUrl: z.string().url().optional(),
  serviceType: z.string().min(1).optional(),
});

const errandRequestSchema = z.object({
  type: z.literal('ERRAND_REQUEST'),
  taskDescription: z.string().min(1),
  pickupLocation: z.string().min(1),
  attachments: z.array(z.string().url()).optional(),
  budgetMin: z.number().nonnegative(),
  budgetMax: z.number().nonnegative(),
  budgetCurrency: z.string().min(1).optional(),
});

const serviceRequestCreateSchema = z.discriminatedUnion('type', [rideRequestSchema, errandRequestSchema]);

const serviceBidCreateSchema = z.object({
  requestId: z.string().min(1),
  price: z.number().positive(),
  message: z.string().optional(),
});

const serviceBidSelectSchema = z.object({
  bidId: z.string().min(1),
});

const serviceWorkerRegisterSchema = z.object({
  role: workerRoleEnum,
  phoneNumber: z.string().min(7),
  profileImage: z.string().url().optional(),
  serviceType: z.string().min(1),
  legalDocumentUrl: z.string().url().optional(),
  minPrice: z.number().nonnegative().optional(),
  maxPrice: z.number().nonnegative().optional(),
  availabilityStatus: availabilityStatusEnum.optional(),
});

const serviceReviewCreateSchema = z.object({
  requestId: z.string().min(1),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

module.exports = {
  serviceRequestCreateSchema,
  serviceBidCreateSchema,
  serviceBidSelectSchema,
  serviceWorkerRegisterSchema,
  serviceReviewCreateSchema,
  workerRoleEnum,
  availabilityStatusEnum,
  requestTypeEnum,
};
