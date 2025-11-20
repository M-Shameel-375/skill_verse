const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User.model');
const ApiError = require('../utils/ApiError');

const handleWebhook = asyncHandler(async (req, res) => {
  const event = req.body;

  switch (event.type) {
    case 'user.created':
      await User.create({
        clerkId: event.data.id,
        email: event.data.email_addresses[0].email_address,
        name: `${event.data.first_name} ${event.data.last_name}`,
        profileImage: { url: event.data.image_url },
      });
      break;
    case 'user.updated':
      await User.findOneAndUpdate(
        { clerkId: event.data.id },
        {
          email: event.data.email_addresses[0].email_address,
          name: `${event.data.first_name} ${event.data.last_name}`,
          profileImage: { url: event.data.image_url },
        }
      );
      break;
    case 'user.deleted':
      await User.findOneAndDelete({ clerkId: event.data.id });
      break;
    default:
      console.log(`Unhandled webhook event type: ${event.type}`);
  }

  res.status(200).json({ received: true });
});

module.exports = {
  handleWebhook,
};
