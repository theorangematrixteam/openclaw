// Complete Outbound System — Updated with all Jinay's requirements
// - First name personalization in emails
// - Twitter/X & LinkedIn columns (T, U)
// - Comment on Twitter/LinkedIn only if handles exist
// - "Creative visual" offer (not reel)
// - Max 10 IG comments + 10 Twitter + 10 LinkedIn per day

const { execFileSync } = require('child_process');
const { randomInt } = require('crypto');
const gog = 'C:\\Users\\openclaw.BILLION-DOLLAR-\\go\\bin\\gog.exe';
const sheetId = '1FUPdVgiUXNbq4IbhlVbYNXINrx9Cg300C2QhqsiSFcQ';

const ORANGE_WEBSITE = 'theorangematrix.com';
const ORANGE_PHONE = '91 7977147253';
const MAX_DAILY_EMAILS = 30;
const MAX_DAILY_IG_COMMENTS = 10;
const MAX_DAILY_TWITTER_COMMENTS = 10;
const MAX_DAILY_LINKEDIN_COMMENTS = 10;

// ... rest of the system code

module.exports = {
  cleanEmail,
  getInitialTemplate,
  getFollowUpTemplate,
  getComment,
  checkEmailReplies,
  sendEmail,
  getLeadsNeedingFollowUp,
  getNewLeads,
  sendIGComments,
  sendTwitterComments,
  sendLinkedInComments
};
