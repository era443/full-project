const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please enter product name'],
    trim: true,
    maxLength: [100, 'Product name cannot exceed 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please enter product price'],
    default: 0.0
  },
  oldPrice: {
    type: Number,
    default: 0.0
  },
  description: {
    type: String,
    required: [true, 'Please enter product description'],
  },
  ratings: {
    type: Number,
    default: 0
  },
  images: [
    {
      public_id: {
        type: String,
        required: true
      },
      url: {
        type: String,
        required: true
      }
    }
  ],
  category: {
    type: String,
    required: [true, 'Please select category for this product'],
    enum: {
      values: [
        'Door Handles',
        'Locks',
        'Hinges',
        'Tower Bolts',
        'Accessories'
      ],
      message: 'Please select correct category for product'
    }
  },
  material: {
    type: String,
    required: [true, 'Please enter product material'],
    enum: {
        values: [
          'Stainless Steel',
          'Brass',
          'Zinc Alloy',
          'Aluminum Alloy'
        ]
    }
  },
  finish: {
    type: String,
    required: [true, 'Please enter product finish'],
    enum: {
        values: [
          'Chrome',
          'Matt Black',
          'Gold',
          'Nickel',
          'Antique'
        ]
    }
  },
  seller: {
    type: String,
    required: [true, 'Please enter product seller']
  },
  stock: {
    type: Number,
    required: [true, 'Please enter product stock'],
    maxLength: [5, 'Product name cannot exceed 5 characters'],
    default: 0
  },
  numOfReviews: {
    type: Number,
    default: 0
  },
  reviews: [
    {
      user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
      },
      name: {
        type: String,
        required: true
      },
      rating: {
        type: Number,
        required: true
      },
      comment: {
        type: String,
        required: true
      },
      purchased: {
        type: Boolean,
        default: false
      }
    }
  ],
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Product', productSchema);
