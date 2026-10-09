const API = {
   // Auth & Dashboard
   LOGIN: '/login',                     // Final: base_url + /login
   LOGOUT: '/logout',                   // Final: base_url + /logout
   DASHBOARD: '/dashboard',             // Final: base_url + /dashboard
   REQUEST_OTP: '/forgot-password/request-otp',
   VERIFY_OTP: '/forgot-password/verify-otp',
   RESET_PASSWORD: '/forgot-password/reset',
   
   // Users Standard Routes
   USERS: '/users',
   USERS_ADD: '/users',

   // Users Dynamic Routes
   USERS_SHOW: (user) => `/users/${user}`,
   USERS_UPDATE: (user) => `/users/${user}`,
   USERS_DELETE: (user) => `/users/${user}`,
   USERS_STATUS: (user) => `/users/${user}/status`,

   // Quiz Routes
   QUIZ_INDEX : '/quiz-types',
   QUIZ_ADD : '/quiz-types',
   QUIZ_SHOW : (quiz) => `/quiz-types/${quiz}`,
   QUIZ_UPDATE : (quiz) => `/quiz-types/${quiz}`,
   QUIZ_DELETE : (quiz) => `/quiz-types/${quiz}`,
   QUIZ_RESTORE : (quiz) => `/quiz-types/${quiz}/restore`,
   QUIZ_STATUS: (quiz) => `/quiz-types/${quiz}/status`,

   // Payment History (admin combined role + ads + ecom + quiz ledger)
PAYMENT_HISTORY_INDEX: '/payment-history',

   // Quiz Subscription Plans (Admin)
QUIZ_SUBSCRIPTION_PLAN_INDEX: 'quiz-subscription-plans',
QUIZ_SUBSCRIPTION_PLAN_ADD: 'quiz-subscription-plans',
QUIZ_SUBSCRIPTION_PLAN_SHOW: (id) => `quiz-subscription-plans/${id}`,
QUIZ_SUBSCRIPTION_PLAN_UPDATE: (id) => `quiz-subscription-plans/${id}`,
QUIZ_SUBSCRIPTION_PLAN_STATUS: (id) => `quiz-subscription-plans/${id}/status`,
QUIZ_SUBSCRIPTION_PLAN_DELETE: (id) => `quiz-subscription-plans/${id}`,
QUIZ_SUBSCRIPTION_PLAN_RESTORE: (id) => `quiz-subscription-plans/${id}/restore`,
QUIZ_SUBSCRIPTION_PURCHASERS_INDEX: '/quiz-subscription-plans/purchasers',
QUIZ_SUBSCRIPTION_PLAN_PURCHASERS: (planId) => `/quiz-subscription-plans/${planId}/purchasers`,

// Quiz Subscriptions (Admin — user purchases, read-only)
QUIZ_SUBSCRIPTIONS_INDEX: '/quiz-subscriptions',

// Quiz Attempts (Admin — user quiz attempts, read-only)
QUIZ_ATTEMPTS_INDEX: '/quiz-attempts',
QUIZ_ATTEMPTS_SHOW: (id) => `/quiz-attempts/${id}`,
// Admin: ek user ke attempts (alias: /quiz-attempts?user_id={id}) + delete (soft delete)
QUIZ_ATTEMPTS_BY_USER: (userId) => `/users/${userId}/quiz-attempts`,
QUIZ_ATTEMPTS_DELETE: (id) => `/quiz-attempts/${id}`,

   QUIZ_SUBSCRIPTION_BY_USER_INDEX: '/user-quiz-subscriptions',
   QUIZ_SUBSCRIPTION_BY_USER_SHOW: (subscription) => `/user-quiz-subscriptions/${subscription}`,
   QUIZ_SUBSCRIPTION_BY_USER_UPDATE: (subscription) => `/user-quiz-subscriptions/${subscription}`,
   QUIZ_SUBSCRIPTION_BY_USER_DELETE: (subscription) => `/user-quiz-subscriptions/${subscription}`,
  
QUESTION_ANS_INDEX: '/question-ans',
QUESTION_ANS_ADMIN_INDEX: '/question-ans',
QUESTION_ANS_BY_QUIZ_TYPE: (quizTypeId) => `/question-ans/${quizTypeId}`,
QUESTION_ANS_ADD: '/question-ans',
QUESTION_ANS_UPDATE: (id) => `/question-ans/${id}`,
QUESTION_ANS_DELETE: (id) => `/question-ans/${id}`,
QUESTION_ANS_RESTORE: (id) => `/question-ans/${id}/restore`,


// Referral (Network) Routes
REFERRAL_ADMIN_INDEX: '/referrals', 
REFERRAL_ADMIN_SHOW: (userId) => `/referrals/${userId}`,
REFERRAL_ADMIN_DELETE: (userId) => `/referrals/${userId}`,

   // News Routes
   NEWS_INDEX : '/news',
   NEWS_ADD : '/news',
   NEWS_SHOW : (news) => `/news/${news}`,
   NEWS_UPDATE : (news) => `/news/${news}`,
   NEWS_DELETE : (news) => `/news/${news}`,
   NEWS_STATUS : (news) => `/news/${news}/status`,

   // Ecom Subscription Routes
   ECOM_SUBSCRIPTION_INDEX: '/ecom-subscriptions',
   ECOM_SUBSCRIPTION_ADD: '/ecom-subscriptions',
   ECOM_SUBSCRIPTION_SHOW: (subscription) => `/ecom-subscriptions/${subscription}`,
   ECOM_SUBSCRIPTION_UPDATE: (subscription) => `/ecom-subscriptions/${subscription}`,
   ECOM_SUBSCRIPTION_DELETE: (subscription) => `/ecom-subscriptions/${subscription}`,
ECOM_SUBSCRIPTION_STATUS: (subscription) => `/ecom-subscriptions/${subscription}/status`,
ECOM_SUBSCRIPTION_PURCHASERS_INDEX: '/ecom-subscriptions/purchasers',
ECOM_SUBSCRIPTION_PLAN_PURCHASERS: (planId) => `/ecom-subscriptions/${planId}/purchasers`,

ADS_DETAIL_INDEX: "/ads-details",
ADS_DETAIL_ADD: "/ads-details",
ADS_DETAIL_SHOW: (id) => `/ads-details/${id}`,
ADS_DETAIL_UPDATE: (id) => `/ads-details/${id}`,
ADS_DETAIL_DELETE: (id) => `/ads-details/${id}`,
ADS_DETAIL_STATUS: (id) => `/ads-details/${id}/status`,
ADS_DETAIL_RESTORE: (id) => `/ads-details/${id}/restore`,

// Ads Subscription Routes
ADS_SUBSCRIPTION_INDEX: '/subscription-plans',
ADS_SUBSCRIPTION_ADD: '/subscription-plans',
ADS_SUBSCRIPTION_SHOW: (subscription) => `/subscription-plans/${subscription}`,
ADS_SUBSCRIPTION_UPDATE: (subscription) => `/subscription-plans/${subscription}`,
ADS_SUBSCRIPTION_DELETE: (subscription) => `/subscription-plans/${subscription}`,
ADS_SUBSCRIPTION_STATUS: (subscription) => `/subscription-plans/${subscription}/status`,
ADS_SUBSCRIPTION_PURCHASERS_INDEX: '/subscription-plans/purchasers',
ADS_SUBSCRIPTION_PLAN_PURCHASERS: (planId) => `/subscription-plans/${planId}/purchasers`,



  // Subscription Plan Routes (role-based)
SUBSCRIPTION_PLAN_INDEX: '/role-subscription-plans',
SUBSCRIPTION_PLAN_ADD: '/role-subscription-plans',
SUBSCRIPTION_PLAN_SHOW: (id) => `/role-subscription-plans/${id}`,
SUBSCRIPTION_PLAN_UPDATE: (plan) => `/role-subscription-plans/${plan}`,
SUBSCRIPTION_PLAN_STATUS: (plan) => `/role-subscription-plans/${plan}/status`,
SUBSCRIPTION_PLAN_DELETE: (plan) => `/role-subscription-plans/${plan}`,
SUBSCRIPTION_PLAN_RESTORE: (plan) => `/role-subscription-plans/${plan}/restore`,

// Ecom Detail (Sell) Routes
ECOM_DETAIL_INDEX: '/ecom-details',
ECOM_DETAIL_ADD: '/ecom-details',
ECOM_DETAIL_SHOW: (item) => `/ecom-details/${item}`,
ECOM_DETAIL_UPDATE: (item) => `/ecom-details/${item}`,
ECOM_DETAIL_STATUS: (item) => `/ecom-details/${item}/status`,
ECOM_DETAIL_DELETE: (item) => `/ecom-details/${item}`,

// Ecom Enquiry Routes
ECOM_ENQUIRY_INDEX: '/ecom-enquiries',
ECOM_ENQUIRY_SHOW: (enquiry) => `/ecom-enquiries/${enquiry}`,
ECOM_ENQUIRY_STATUS: (enquiry) => `/ecom-enquiries/${enquiry}/status`,
ECOM_ENQUIRY_DELETE: (enquiry) => `/ecom-enquiries/${enquiry}`,

// Reports Routes
REPORTS_PRODUCT_ENQUIRY_INDEX: '/reports/product-enquiry',
REPORTS_PRODUCT_ENQUIRY_DELETE: (id) => `/reports/product-enquiry/${id}`,

REPORTS_USER_WISE_INDEX: '/reports/user-wise',
REPORTS_USER_WISE_DELETE: (id) => `/reports/user-wise/${id}`,

REPORTS_SUBSCRIPTION_INDEX: '/reports/subscription',
REPORTS_SUBSCRIPTION_DELETE: (id) => `/reports/subscription/${id}`,

REPORTS_ADS_VIEW_INDEX: '/reports/ads-view',
REPORTS_ADS_VIEW_DELETE: (id) => `/reports/ads-view/${id}`,


// E-Paper
EPAPER_INDEX: '/e-papers',
EPAPER_ADD: '/e-papers',
EPAPER_SHOW: (id) => `/e-papers/${id}`,
EPAPER_UPDATE: (id) => `/e-papers/${id}`,
EPAPER_DELETE: (id) => `/e-papers/${id}`,

// Advertisement
AD_INDEX: '/advertisements',
AD_ADD: '/advertisements',
AD_SHOW: (id) => `/advertisements/${id}`,
AD_UPDATE: (id) => `/advertisements/${id}`,
AD_DELETE: (id) => `/advertisements/${id}`,
AD_STATUS: (id) => `/advertisements/${id}/status`,

// Wallet
WALLET_INDEX: '/wallets',
WALLET_SHOW: (userId) => `/wallets/${userId}`,
// DELETE /api/rti-admin/wallet/{transactionId} (alias: /wallet-transactions/{id}) — {id} = wallet TRANSACTION id
// NOTE: ye /rti-admin prefix par hai (apiClient), /admin-rti (adminRtiClient) par nahi.
WALLET_TXN_DELETE: (id) => `/wallet/${id}`,

// Withdrawal
WITHDRAWAL_INDEX: '/withdrawals',
WITHDRAWAL_SHOW: (id) => `/withdrawals/${id}`,
WITHDRAWAL_APPROVE: (id) => `/withdrawals/${id}/approve`,
WITHDRAWAL_REJECT: (id) => `/withdrawals/${id}/reject`,
// DELETE /api/rti-admin/withdrawals/{id} — sirf paid / rejected / cancelled par chalta hai (apiClient)
WITHDRAWAL_DELETE: (id) => `/withdrawals/${id}`,

// Office Address
OFFICE_INDEX: '/offices',
OFFICE_ADD: '/offices',
OFFICE_SHOW: (id) => `/offices/${id}`,
OFFICE_UPDATE: (id) => `/offices/${id}`,
OFFICE_DELETE: (id) => `/offices/${id}`,

// News Notification
NOTIFICATION_INDEX: '/notifications',
NOTIFICATION_ADD: '/notifications',
NOTIFICATION_SEND: (id) => `/notifications/${id}/send`,
NOTIFICATION_DELETE: (id) => `/notifications/${id}`,

// Contact Us
CONTACT_INDEX: '/contacts',
CONTACT_DELETE: (id) => `/contacts/${id}`,

// Ads View Tracking
ADS_VIEW_TRACKING_INDEX: '/ads-view-tracking',
ADS_VIEW_TRACKING_DELETE: (id) => `/ads-view-tracking/${id}`,

// User Follows (Admin RTI)
USER_FOLLOWS_INDEX: '/user-follows',
USER_FOLLOWS_DELETE: (id) => `/user-follows/${id}`,

// User Blocks (Admin RTI)
USER_BLOCKS_INDEX: '/user-blocks',
USER_BLOCKS_DELETE: (id) => `/user-blocks/${id}`,

// Profile Update Requests (Admin RTI) — real backend routes
PROFILE_UPDATE_REQUESTS_INDEX: '/users/pending-profiles',
PROFILE_UPDATE_REQUESTS_APPROVE: (id) => `/users/${id}/approve-profile`,
PROFILE_UPDATE_REQUESTS_REJECT: (id) => `/users/${id}/reject-profile`,


};


export default API;