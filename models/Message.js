import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    maxlength: [2000, 'Message cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['new', 'read', 'replied', 'archived'],
    default: 'new'
  },
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  notes: {
    type: String,
    maxlength: [1000, 'Notes cannot exceed 1000 characters']
  },
  repliedAt: Date,
  archivedAt: Date
}, {
  timestamps: true
});

// Index for queries
messageSchema.index({ status: 1, createdAt: -1 });
messageSchema.index({ priority: 1, status: 1 });
messageSchema.index({ email: 1 });

// Automatically update timestamps when status changes
messageSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'replied' && !this.repliedAt) {
      this.repliedAt = new Date();
    }
    if (this.status === 'archived' && !this.archivedAt) {
      this.archivedAt = new Date();
    }
  }
  next();
});

const Message = mongoose.model('Message', messageSchema);

export default Message;