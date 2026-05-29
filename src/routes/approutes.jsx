import React from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Login from "../components/auth/login";
import Forgot from "../components/auth/forgot";
import AdminLayout from "../layouts/adminlayout";
import NotFound from "../pages/error/not-found";
import Error400 from "../pages/Error400";
import Error403 from "../pages/Error403";
import Error500 from "../pages/Error500";
import Error503 from "../pages/Error503";
import { hasAuthSession } from "../services/authSession";

import Dashboard from "../pages/dashboard/dashboard";
import DashboardView from "../pages/dashboard/dashboard-view";
import DashboardDeleted from "../pages/dashboard/dashboard-deleted";
import DashboardStatus from "../pages/dashboard/dashboard-status";

import UserProfile from "../pages/user-profile/user-profile";
import ProfileView from "../pages/user-profile/profile-view";
import ProfileAdd from "../pages/user-profile/profile-add";
import ProfileUpdate from "../pages/user-profile/profile-update";
import ProfileDeleted from "../pages/user-profile/profile-deleted";
import ProfileStatus from "../pages/user-profile/profile-status";

import Network from "../pages/network/network";
import NetworkView from "../pages/network/network-view";
import NetworkDeleted from "../pages/network/network-deleted";
import NetworkStatus from "../pages/network/network-status";

import Wallets from "../pages/wallets/wallets";
import WalletsView from "../pages/wallets/wallets-view";
import WalletsDeleted from "../pages/wallets/wallets-deleted";

import Withdrawal from "../pages/withdrawal/withdrawal";
import WithdrawalView from "../pages/withdrawal/withdrawal-view";
import WithdrawalDeleted from "../pages/withdrawal/withdrawal-deleted";

import News from "../pages/news/news";
import NewsView from "../pages/news/news-view";
import NewsAdd from "../pages/news/news-add";
import NewsUpdate from "../pages/news/news-update";
import NewsDeleted from "../pages/news/news-deleted";
import NewsStatus from "../pages/news/news-status";

import SubscriptionPlan from "../pages/subscription-plan/subscription-plan";
import SubscriptionPlanView from "../pages/subscription-plan/subscription-plan-view";
import SubscriptionPlanAdd from "../pages/subscription-plan/subscription-plan-add";
import SubscriptionPlanUpdate from "../pages/subscription-plan/subscription-plan-update";
import SubscriptionPlanDeleted from "../pages/subscription-plan/subscription-plan-deleted";
import SubscriptionPlanStatus from "../pages/subscription-plan/subscription-plan-status";

import Advertisement from "../pages/advertisement/advertisement";
import AdvertisementView from "../pages/advertisement/advertisement-view";
import AdvertisementAdd from "../pages/advertisement/advertisement-add";
import AdvertisementUpdate from "../pages/advertisement/advertisement-update";
import AdvertisementDeleted from "../pages/advertisement/advertisement-deleted";
import AdvertisementStatus from "../pages/advertisement/advertisement-status";

import EPaper from "../pages/e-paper/e-paper";
import EPaperView from "../pages/e-paper/e-paper-view";
import EPaperAdd from "../pages/e-paper/e-paper-add";
import EPaperUpdate from "../pages/e-paper/e-paper-update";
import EPaperDeleted from "../pages/e-paper/e-paper-deleted";

import Quiz from "../pages/quiz/quiz";
import QuizView from "../pages/quiz/quiz-view";
import QuizAdd from "../pages/quiz/quiz-add";
import QuizUpdate from "../pages/quiz/quiz-update";
import QuizDeleted from "../pages/quiz/quiz-deleted";
import QuizStatus from "../pages/quiz/quiz-status";

import OfficesAddresses from "../pages/offices-addresses/offices-addresses";
import OfficesAddressesView from "../pages/offices-addresses/offices-addresses-view";
import OfficesAddressesAdd from "../pages/offices-addresses/offices-addresses-add";
import OfficesAddressesUpdate from "../pages/offices-addresses/offices-addresses-update";
import OfficesAddressesDeleted from "../pages/offices-addresses/offices-addresses-deleted";

import Notification from "../pages/news-notification/notification";
import NotificationView from "../pages/news-notification/notification-view";
import NotificationDeleted from "../pages/news-notification/notification-deleted";

import ContactUs from "../pages/contact-us/contact-us";
import ContactUsView from "../pages/contact-us/contact-us-view";
import ContactUsDeleted from "../pages/contact-us/contact-us-deleted";

import EcommerceSubscription from "../pages/ecommerce-subscription/ecommerce-subscription";
import EcommerceSubscriptionView from "../pages/ecommerce-subscription/ecommerce-subscription-view";
import EcommerceSubscriptionAdd from "../pages/ecommerce-subscription/ecommerce-subscription-add";
import EcommerceSubscriptionUpdate from "../pages/ecommerce-subscription/ecommerce-subscription-update";
import EcommerceSubscriptionDeleted from "../pages/ecommerce-subscription/ecommerce-subscription-deleted";
import EcommerceSubscriptionStatus from "../pages/ecommerce-subscription/ecommerce-subscription-status";

import EcomBuy from "../pages/ecom-buy/ecom-buy";
import EcomBuyView from "../pages/ecom-buy/ecom-buy-view";
import EcomBuyAdd from "../pages/ecom-buy/ecom-buy-add";
import EcomBuyUpdate from "../pages/ecom-buy/ecom-buy-update";
import EcomBuyDeleted from "../pages/ecom-buy/ecom-buy-deleted";
import EcomBuyStatus from "../pages/ecom-buy/ecom-buy-status";

import EcomSell from "../pages/ecom-sell/ecom-sell";
import EcomSellView from "../pages/ecom-sell/ecom-sell-view";
import EcomSellAdd from "../pages/ecom-sell/ecom-sell-add";
import EcomSellUpdate from "../pages/ecom-sell/ecom-sell-update";
import EcomSellDeleted from "../pages/ecom-sell/ecom-sell-deleted";
import EcomSellStatus from "../pages/ecom-sell/ecom-sell-status";

import ProductEnquiry from "../pages/product-enquiry/product-enquiry";
import ProductEnquiryView from "../pages/product-enquiry/product-enquiry-view";
import ProductEnquiryDeleted from "../pages/product-enquiry/product-enquiry-deleted";

import AdsSubscription from "../pages/ads-subscription/ads-subscription";
import AdsSubscriptionView from "../pages/ads-subscription/ads-subscription-view";
import AdsSubscriptionAdd from "../pages/ads-subscription/ads-subscription-add";
import AdsSubscriptionUpdate from "../pages/ads-subscription/ads-subscription-update";
import AdsSubscriptionDeleted from "../pages/ads-subscription/ads-subscription-deleted";
import AdsSubscriptionStatus from "../pages/ads-subscription/ads-subscription-status";

import AdsManagement from "../pages/ads-management/ads-management";
import AdsManagementView from "../pages/ads-management/ads-management-view";
import AdsManagementDeleted from "../pages/ads-management/ads-management-deleted";

import AdsViewTracking from "../pages/ads-view-tracking/ads-view-tracking";
import AdsViewTrackingView from "../pages/ads-view-tracking/ads-view-tracking-view";
import AdsViewTrackingDeleted from "../pages/ads-view-tracking/ads-view-tracking-deleted";

import ReportsProductEnquiry from "../pages/reports-product-enquiry/reports-product-enquiry";
import ReportsProductEnquiryView from "../pages/reports-product-enquiry/reports-product-enquiry-view";
import ReportsProductEnquiryDeleted from "../pages/reports-product-enquiry/reports-product-enquiry-deleted";

import ReportsUserWise from "../pages/reports-user-wise/reports-user-wise";
import ReportsUserWiseView from "../pages/reports-user-wise/reports-user-wise-view";
import ReportsUserWiseDeleted from "../pages/reports-user-wise/reports-user-wise-deleted";

import ReportsSubscription from "../pages/reports-subscription/reports-subscription";
import ReportsSubscriptionView from "../pages/reports-subscription/reports-subscription-view";
import ReportsSubscriptionDeleted from "../pages/reports-subscription/reports-subscription-deleted";

import ReportsAdsView from "../pages/reports-ads-view/reports-ads-view";
import ReportsAdsViewView from "../pages/reports-ads-view/reports-ads-view-view";
import ReportsAdsViewDeleted from "../pages/reports-ads-view/reports-ads-view-deleted";

const moduleRoutes = [
  { slug: "dashboard", List: Dashboard, View: DashboardView, Deleted: DashboardDeleted, Status: DashboardStatus },
  { slug: "user-profile", List: UserProfile, View: ProfileView, Add: ProfileAdd, Update: ProfileUpdate, Deleted: ProfileDeleted, Status: ProfileStatus },
  { slug: "network", List: Network, View: NetworkView, Deleted: NetworkDeleted, Status: NetworkStatus },
  { slug: "wallets", List: Wallets, View: WalletsView, Deleted: WalletsDeleted },
  { slug: "withdrawal", List: Withdrawal, View: WithdrawalView, Deleted: WithdrawalDeleted },
  { slug: "news", List: News, View: NewsView, Add: NewsAdd, Update: NewsUpdate, Deleted: NewsDeleted, Status: NewsStatus },
  { slug: "subscription-plan", List: SubscriptionPlan, View: SubscriptionPlanView, Add: SubscriptionPlanAdd, Update: SubscriptionPlanUpdate, Deleted: SubscriptionPlanDeleted, Status: SubscriptionPlanStatus },
  { slug: "advertisement", List: Advertisement, View: AdvertisementView, Add: AdvertisementAdd, Update: AdvertisementUpdate, Deleted: AdvertisementDeleted, Status: AdvertisementStatus },
  { slug: "e-paper", List: EPaper, View: EPaperView, Add: EPaperAdd, Update: EPaperUpdate, Deleted: EPaperDeleted },
  { slug: "quiz", List: Quiz, View: QuizView, Add: QuizAdd, Update: QuizUpdate, Deleted: QuizDeleted, Status: QuizStatus },
  { slug: "offices-addresses", List: OfficesAddresses, View: OfficesAddressesView, Add: OfficesAddressesAdd, Update: OfficesAddressesUpdate, Deleted: OfficesAddressesDeleted },
  { slug: "news-notification", List: Notification, View: NotificationView, Deleted: NotificationDeleted },
  { slug: "contact-us", List: ContactUs, View: ContactUsView, Deleted: ContactUsDeleted },
  { slug: "ecommerce-subscription", List: EcommerceSubscription, View: EcommerceSubscriptionView, Add: EcommerceSubscriptionAdd, Update: EcommerceSubscriptionUpdate, Deleted: EcommerceSubscriptionDeleted, Status: EcommerceSubscriptionStatus },
  { slug: "ecom-buy", List: EcomBuy, View: EcomBuyView, Add: EcomBuyAdd, Update: EcomBuyUpdate, Deleted: EcomBuyDeleted, Status: EcomBuyStatus },
  { slug: "ecom-sell", List: EcomSell, View: EcomSellView, Add: EcomSellAdd, Update: EcomSellUpdate, Deleted: EcomSellDeleted, Status: EcomSellStatus },
  { slug: "product-enquiry", List: ProductEnquiry, View: ProductEnquiryView, Deleted: ProductEnquiryDeleted },
  { slug: "ads-subscription", List: AdsSubscription, View: AdsSubscriptionView, Add: AdsSubscriptionAdd, Update: AdsSubscriptionUpdate, Deleted: AdsSubscriptionDeleted, Status: AdsSubscriptionStatus },
  { slug: "ads-management", List: AdsManagement, View: AdsManagementView, Deleted: AdsManagementDeleted },
  { slug: "ads-view-tracking", List: AdsViewTracking, View: AdsViewTrackingView, Deleted: AdsViewTrackingDeleted },
  { slug: "reports-product-enquiry", List: ReportsProductEnquiry, View: ReportsProductEnquiryView, Deleted: ReportsProductEnquiryDeleted },
  { slug: "reports-user-wise", List: ReportsUserWise, View: ReportsUserWiseView, Deleted: ReportsUserWiseDeleted },
  { slug: "reports-subscription", List: ReportsSubscription, View: ReportsSubscriptionView, Deleted: ReportsSubscriptionDeleted },
  { slug: "reports-ads-view", List: ReportsAdsView, View: ReportsAdsViewView, Deleted: ReportsAdsViewDeleted }
];

const isLoggedIn = hasAuthSession;

const PublicOnly = ({ children }) => {
  return isLoggedIn() ? <Navigate to="/admin/dashboard" replace /> : children;
};

const ProtectedLayout = () => {
  return isLoggedIn() ? <AdminLayout /> : <Navigate to="/" replace />;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/forgot-password" element={<Forgot />} />
        <Route path="/400" element={<Error400 />} />
        <Route path="/403" element={<Error403 />} />
        <Route path="/500" element={<Error500 />} />
        <Route path="/503" element={<Error503 />} />

        <Route path="/admin" element={<ProtectedLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          {moduleRoutes.map(({ slug, List, View, Add, Update, Deleted, Status }) => (
            <React.Fragment key={slug}>
              <Route path={slug} element={<List />} />
              <Route path={`${slug}/view`} element={<View />} />
              {Add && <Route path={`${slug}/add`} element={<Add />} />}
              {Update && <Route path={`${slug}/update`} element={<Update />} />}
              {Deleted && <Route path={`${slug}/deleted`} element={<Deleted />} />}
              {Status && <Route path={`${slug}/status`} element={<Status />} />}
            </React.Fragment>
          ))}
          <Route path="inbox" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
