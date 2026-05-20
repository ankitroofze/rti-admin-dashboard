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

import Dashboard from "../pages/dashboard/dashboard";
import DashboardView from "../pages/dashboard/dashboard-view";
import DashboardAdd from "../pages/dashboard/dashboard-add";
import DashboardUpdate from "../pages/dashboard/dashboard-update";
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
import NetworkAdd from "../pages/network/network-add";
import NetworkUpdate from "../pages/network/network-update";
import NetworkDeleted from "../pages/network/network-deleted";
import NetworkStatus from "../pages/network/network-status";

import Wallets from "../pages/wallets/wallets";
import WalletsView from "../pages/wallets/wallets-view";
import WalletsAdd from "../pages/wallets/wallets-add";
import WalletsUpdate from "../pages/wallets/wallets-update";
import WalletsDeleted from "../pages/wallets/wallets-deleted";
import WalletsStatus from "../pages/wallets/wallets-status";

import Withdrawal from "../pages/withdrawal/withdrawal";
import WithdrawalView from "../pages/withdrawal/withdrawal-view";
import WithdrawalAdd from "../pages/withdrawal/withdrawal-add";
import WithdrawalUpdate from "../pages/withdrawal/withdrawal-update";
import WithdrawalDeleted from "../pages/withdrawal/withdrawal-deleted";
import WithdrawalStatus from "../pages/withdrawal/withdrawal-status";

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
import EPaperStatus from "../pages/e-paper/e-paper-status";

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
import OfficesAddressesStatus from "../pages/offices-addresses/offices-addresses-status";

import ContactUs from "../pages/contact-us/contact-us";
import ContactUsView from "../pages/contact-us/contact-us-view";
import ContactUsAdd from "../pages/contact-us/contact-us-add";
import ContactUsUpdate from "../pages/contact-us/contact-us-update";
import ContactUsDeleted from "../pages/contact-us/contact-us-deleted";
import ContactUsStatus from "../pages/contact-us/contact-us-status";

import Notification from "../pages/news-notification/notification";
import NotificationView from "../pages/news-notification/notification-view";
import NotificationAdd from "../pages/news-notification/notification-add";
import NotificationUpdate from "../pages/news-notification/notification-update";
import NotificationDeleted from "../pages/news-notification/notification-deleted";
import NotificationStatus from "../pages/news-notification/notification-status";
import { ModuleDelete, ModuleForm, ModuleList, ModuleStatus, ModuleView } from "../pages/moduleFactory";

const moduleRoutes = [
  ["dashboard", Dashboard, DashboardView, DashboardAdd, DashboardUpdate, DashboardDeleted, DashboardStatus],
  ["user-profile", UserProfile, ProfileView, ProfileAdd, ProfileUpdate, ProfileDeleted, ProfileStatus],
  ["network", Network, NetworkView, NetworkAdd, NetworkUpdate, NetworkDeleted, NetworkStatus],
  ["wallets", Wallets, WalletsView, WalletsAdd, WalletsUpdate, WalletsDeleted, WalletsStatus],
  ["withdrawal", Withdrawal, WithdrawalView, WithdrawalAdd, WithdrawalUpdate, WithdrawalDeleted, WithdrawalStatus],
  ["news", News, NewsView, NewsAdd, NewsUpdate, NewsDeleted, NewsStatus],
  ["subscription-plan", SubscriptionPlan, SubscriptionPlanView, SubscriptionPlanAdd, SubscriptionPlanUpdate, SubscriptionPlanDeleted, SubscriptionPlanStatus],
  ["advertisement", Advertisement, AdvertisementView, AdvertisementAdd, AdvertisementUpdate, AdvertisementDeleted, AdvertisementStatus],
  ["e-paper", EPaper, EPaperView, EPaperAdd, EPaperUpdate, EPaperDeleted, EPaperStatus],
  ["quiz", Quiz, QuizView, QuizAdd, QuizUpdate, QuizDeleted, QuizStatus],
  ["offices-addresses", OfficesAddresses, OfficesAddressesView, OfficesAddressesAdd, OfficesAddressesUpdate, OfficesAddressesDeleted, OfficesAddressesStatus],
  ["news-notification", Notification, NotificationView, NotificationAdd, NotificationUpdate, NotificationDeleted, NotificationStatus],
  ["contact-us", ContactUs, ContactUsView, ContactUsAdd, ContactUsUpdate, ContactUsDeleted, ContactUsStatus],
];

const newModuleSlugs = [
  "ecommerce-subscription",
  "product-enquiry",
  "ads-subscription",
  "ads-management",
  "ads-view-tracking",
  "reports-product-enquiry",
  "reports-user-wise",
  "reports-subscription",
  "reports-ads-view",
];

const PublicOnly = ({ children }) => {
  return localStorage.getItem("authToken") ? <Navigate to="/admin/dashboard" replace /> : children;
};

const ProtectedLayout = () => {
  return localStorage.getItem("authToken") ? <AdminLayout /> : <Navigate to="/" replace />;
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
          {moduleRoutes.map(([slug, List, View, Add, Update, Deleted, Status]) => (
            <React.Fragment key={slug}>
              <Route path={slug} element={<List />} />
              <Route path={`${slug}/view`} element={<View />} />
              <Route path={`${slug}/add`} element={<Add />} />
              <Route path={`${slug}/update`} element={<Update />} />
              <Route path={`${slug}/deleted`} element={<Deleted />} />
              <Route path={`${slug}/status`} element={<Status />} />
            </React.Fragment>
          ))}
          {newModuleSlugs.map((slug) => (
            <React.Fragment key={slug}>
              <Route path={slug} element={<ModuleList slug={slug} />} />
              <Route path={`${slug}/view`} element={<ModuleView slug={slug} />} />
              <Route path={`${slug}/add`} element={<ModuleForm slug={slug} mode="Add" />} />
              <Route path={`${slug}/update`} element={<ModuleForm slug={slug} mode="Update" />} />
              <Route path={`${slug}/deleted`} element={<ModuleDelete slug={slug} />} />
              <Route path={`${slug}/status`} element={<ModuleStatus slug={slug} />} />
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
