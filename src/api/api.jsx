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

   // Advertisement Subscription Routes
   ADS_SUBSCRIPTION_INDEX: '/ads-subscriptions',
   ADS_SUBSCRIPTION_ADD: '/ads-subscriptions',
   ADS_SUBSCRIPTION_SHOW: (subscription) => `/ads-subscriptions/${subscription}`,
   ADS_SUBSCRIPTION_UPDATE: (subscription) => `/ads-subscriptions/${subscription}`,
   ADS_SUBSCRIPTION_DELETE: (subscription) => `/ads-subscriptions/${subscription}`,
   ADS_SUBSCRIPTION_STATUS: (subscription) => `/ads-subscriptions/${subscription}/status`,

  

};

export default API;
