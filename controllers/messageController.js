import Message from '../models/Message.js';

// @desc    Get all messages
// @route   GET /api/messages
// @access  Public (should be Admin only in production)
export const getMessages = async (req, res, next) => {
  try {
    const { status, priority, page = 1, limit = 20, sort = '-createdAt' } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const skip = (Number(page) - 1) * Number(limit);

    const messages = await Message.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit))
      .lean();

    const total = await Message.countDocuments(filter);

    // Get counts by status
    const statusCounts = await Message.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: messages,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      statusCounts: statusCounts.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {})
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single message
// @route   GET /api/messages/:id
// @access  Public (should be Admin only in production)
export const getMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Auto-mark as read when viewed
    if (message.status === 'new') {
      message.status = 'read';
      await message.save();
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create message (Contact form submission)
// @route   POST /api/messages
// @access  Public
export const createMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message, priority } = req.body;

    const newMessage = await Message.create({
      name,
      email,
      phone,
      subject,
      message,
      priority: priority || 'normal',
      status: 'new'
    });

    res.status(201).json({
      success: true,
      data: newMessage,
      message: 'Message sent successfully. We will get back to you soon!'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark message as read
// @route   PUT /api/messages/:id/read
// @access  Public (should be Admin only in production)
export const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    message.status = 'read';
    await message.save();

    res.json({
      success: true,
      data: message,
      message: 'Message marked as read'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark message as replied
// @route   PUT /api/messages/:id/reply
// @access  Public (should be Admin only in production)
export const markAsReplied = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    message.status = 'replied';
    if (notes) message.notes = notes;
    await message.save();

    res.json({
      success: true,
      data: message,
      message: 'Message marked as replied'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Archive message
// @route   PUT /api/messages/:id/archive
// @access  Public (should be Admin only in production)
export const archiveMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    message.status = 'archived';
    await message.save();

    res.json({
      success: true,
      data: message,
      message: 'Message archived'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete message
// @route   DELETE /api/messages/:id
// @access  Public (should be Admin only in production)
export const deleteMessage = async (req, res, next) => {
  try {
    const { id } = req.params;

    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    await message.deleteOne();

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update message priority
// @route   PUT /api/messages/:id/priority
// @access  Public (should be Admin only in production)
export const updatePriority = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    if (!['low', 'normal', 'high', 'urgent'].includes(priority)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid priority. Must be: low, normal, high, or urgent'
      });
    }

    const message = await Message.findByIdAndUpdate(
      id,
      { priority },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
        
      success: true,
      data: message,
      message: 'Priority updated successfully'
    });
  } catch (error) {
    next(error);
  }
};