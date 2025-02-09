import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  List,
  ListItem,
  ListItemPrefix,
  Accordion,
  AccordionHeader,
  AccordionBody,
} from "@material-tailwind/react";
import { useNavigate, useLocation } from "react-router-dom";
import { firestore } from "../../config/firebase"; // Assuming your Firebase config is set here
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
} from "firebase/firestore";
import {
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  PresentationChartBarIcon,
  ShoppingBagIcon,
  UserCircleIcon,
  Cog6ToothIcon,
  InboxIcon,
  PowerIcon,
  BellIcon,
} from "@heroicons/react/24/solid";
import logo from "../assets/main_logo.png";
import profile from "../assets/profile.jpg";
import dashboardIcon from "../assets/dashboardIcon.png";
import manageLogo from "../assets/manageProducts.png";
import transactionsLogo from "../assets/transactionsLogo.png";
import ordersIcon from "../assets/ordersIcon.png";
import logoutIcon from "../assets/logoutIcon.png";
import Analytics from "../pages/Analytics";
import Reporting from "../pages/Reporting";
import Orders from "../pages/Orders";
import Products from "../pages/Products";
import ViewProducts from "../pages/ViewProducts"; // Assuming these are your page components
import Profile from "../pages/Profile";

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const userData = location.state?.userData;
  const [open, setOpen] = useState(0);
  const [activeContent, setActiveContent] = useState(<Analytics />);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastClickedContent, setLastClickedContent] = useState(<Analytics />);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false); // To toggle notifications list

  const limit = 10; // Set limit for displaying notifications

  // Firebase query for unread notifications
  useEffect(() => {
    const q = query(
      collection(firestore, "notifications"),
      where("status", "in", ["unread", "read"])
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notificationsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Sort notifications by timestamp in descending order (latest first)
      notificationsData.sort(
        (a, b) => b.timestamp.seconds - a.timestamp.seconds
      );

      setNotifications(notificationsData);
      setUnreadCount(
        notificationsData.filter((n) => n.status === "unread").length
      );
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  const updateContent = (content) => {
    if (content === "Analytics") {
      setActiveContent(<Analytics />);
      setLastClickedContent(<Analytics />);
    }
    if (content === "Reporting") {
      setActiveContent(<Reporting />);
      setLastClickedContent(<Reporting />);
    }
    if (content === "Orders") {
      setActiveContent(<Orders />);
      setLastClickedContent(<Orders />);
    }
    if (content === "ViewProducts") {
      setActiveContent(<ViewProducts />);
      setLastClickedContent(<ViewProducts />);
    }
    if (content === "Products") {
      setActiveContent(<Products />);
      setLastClickedContent(<Products />);
    }
    if (content === "Profile") {
      setActiveContent(<Profile />);
      setLastClickedContent(<Profile />);
    }
    if (content === "Log Out") {
      setActiveContent(null);
      setShowLogoutModal(true);
    }
  };

  const handleOpen = (value) => {
    setOpen(open === value ? 0 : value);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false);
    setActiveContent(lastClickedContent);
  };

  const handleNotificationClick = (notificationId) => {
    const notificationRef = doc(firestore, "notifications", notificationId);
    updateDoc(notificationRef, { status: "read" }).then(() => {
      setUnreadCount((prevCount) => prevCount - 1);
    });
  };

  const logOutConfirm = () => {
    navigate("/"); // Redirect to login/logout
  };

  return (
    <div className="flex h-[100vh]">
      {/* Sidebar */}
      <Card
        className={`h-full w-64 transition-transform transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:block fixed top-0 left-0 bottom-0 z-999 overflow-y-auto border-r border-gray-300`}
      >
        <div className="absolute top-4 right-4 z-10 cursor-pointer lg:hidden">
          <button
            onClick={closeSidebar} // Close sidebar when X is clicked
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600" />
          </button>
        </div>
        <div className="sticky top-0 pt-6 pb-4 mb-2">
          <img src={logo} className="w-40 h-25 mx-auto" />
        </div>

        <List className="overflow-y-auto flex-1">
          {/* Dashboard Accordion */}
          <Accordion
            open={open === 1}
            icon={
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`mx-auto h-4 w-4 transition-transform ${
                  open === 1 ? "rotate-180" : ""
                }`}
              />
            }
          >
            <ListItem className="p-0" selected={open === 1}>
              <AccordionHeader
                onClick={() => handleOpen(1)}
                className="border-b-0 p-3"
              >
                <ListItemPrefix>
                  <img src={dashboardIcon} className="h-6 w-6 text-[#724E2C]" />
                </ListItemPrefix>
                <Typography color="blue-gray" className="mr-auto font-normal">
                  Dashboard
                </Typography>
              </AccordionHeader>
            </ListItem>
            <AccordionBody className="py-1">
              <List className="p-0">
                <ListItem
                  className="cursor-pointer"
                  onClick={() => updateContent("Analytics")}
                >
                  <ListItemPrefix>
                    <ChevronDownIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <Typography>Analytics</Typography>
                </ListItem>
                <ListItem
                  className="cursor-pointer"
                  onClick={() => updateContent("Reporting")}
                >
                  <ListItemPrefix>
                    <ChevronDownIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <Typography>Reporting</Typography>
                </ListItem>
              </List>
            </AccordionBody>
          </Accordion>

          {/* E-Commerce Accordion */}
          <Accordion
            open={open === 2}
            icon={
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`mx-auto h-4 w-4 transition-transform ${
                  open === 2 ? "rotate-180" : ""
                }`}
              />
            }
          >
            <ListItem className="p-0" selected={open === 2}>
              <AccordionHeader
                onClick={() => handleOpen(2)}
                className="border-b-0 p-3"
              >
                <ListItemPrefix>
                  <img src={manageLogo} className="h-6 w-6 text-[#724E2C]" />
                </ListItemPrefix>
                <Typography color="blue-gray" className="mr-auto font-normal">
                  Manage Products
                </Typography>
              </AccordionHeader>
            </ListItem>
            <AccordionBody className="py-1">
              <List className="p-0">
                <ListItem
                  className="cursor-pointer"
                  onClick={() => updateContent("Products")}
                >
                  <ListItemPrefix>
                    <ChevronDownIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <Typography>Add Products</Typography>
                </ListItem>
                <ListItem
                  className="cursor-pointer"
                  onClick={() => updateContent("ViewProducts")}
                >
                  <ListItemPrefix>
                    <ChevronDownIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <Typography>View Products</Typography>
                </ListItem>
              </List>
            </AccordionBody>
          </Accordion>

          {/* Transactions  Accordion */}
          <Accordion
            open={open === 4}
            icon={
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`mx-auto h-4 w-4 transition-transform ${
                  open === 4 ? "rotate-180" : ""
                }`}
              />
            }
          >
            <ListItem className="p-0" selected={open === 4}>
              <AccordionHeader
                onClick={() => handleOpen(4)}
                className="border-b-0 p-3"
              >
                <ListItemPrefix>
                  <img
                    src={transactionsLogo}
                    className="h-6 w-6 text-[#724E2C]"
                  />
                </ListItemPrefix>
                <Typography color="blue-gray" className="mr-auto font-normal">
                  Transactions
                </Typography>
              </AccordionHeader>
            </ListItem>
            <AccordionBody className="py-1">
              <List className="p-0">
                <ListItem
                  className="cursor-pointer"
                  onClick={() => updateContent("Orders")}
                >
                  <ListItemPrefix>
                    <ChevronDownIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <Typography>Payments</Typography>
                </ListItem>
                <ListItem
                  className="cursor-pointer"
                  onClick={() => updateContent("Requests")}
                >
                  <ListItemPrefix>
                    <ChevronDownIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <Typography>PaymentHistory</Typography>
                </ListItem>
              </List>
            </AccordionBody>
          </Accordion>

          {/* Orders Accordion */}
          <Accordion
            open={open === 5}
            icon={
              <ChevronDownIcon
                strokeWidth={2.5}
                className={`mx-auto h-4 w-4 transition-transform ${
                  open === 4 ? "rotate-180" : ""
                }`}
              />
            }
          >
            <ListItem className="p-0" selected={open === 4}>
              <AccordionHeader
                onClick={() => handleOpen(5)}
                className="border-b-0 p-3"
              >
                <ListItemPrefix>
                  <img src={ordersIcon} className="h-6 w-6 text-[#724E2C]" />
                </ListItemPrefix>
                <Typography color="blue-gray" className="mr-auto font-normal">
                  Orders
                </Typography>
              </AccordionHeader>
            </ListItem>
            <AccordionBody className="py-1">
              <List className="p-0">
                <ListItem
                  className="cursor-pointer"
                  onClick={() => updateContent("Orders")}
                >
                  <ListItemPrefix>
                    <ChevronDownIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <Typography>Add Orders </Typography>
                </ListItem>
                <ListItem
                  className="cursor-pointer"
                  onClick={() => updateContent("Requests")}
                >
                  <ListItemPrefix>
                    <ChevronDownIcon strokeWidth={3} className="h-3 w-5" />
                  </ListItemPrefix>
                  <Typography>Manage Orders</Typography>
                </ListItem>
              </List>
            </AccordionBody>
          </Accordion>

          {/* Other Menu Items */}

          <ListItem
            onClick={() => updateContent("Profile")}
            className="group cursor-pointer relative hover:bg-gray-200 p-2"
          >
            <ListItemPrefix onClick={() => updateContent("Profile")}>
              <UserCircleIcon className="h-6 w-6 text-[#724E2C]" />
            </ListItemPrefix>
            <Typography className="ml-2">Profile</Typography>
          </ListItem>

          <ListItem
            onClick={() => updateContent("Settings")}
            className="group cursor-pointer relative hover:bg-gray-200 p-2"
          >
            <ListItemPrefix>
              <Cog6ToothIcon className="h-6 w-6 text-[#724E2C]" />
            </ListItemPrefix>
            <Typography className="ml-2">Settings</Typography>
          </ListItem>

          <ListItem
            onClick={() => updateContent("Log Out")}
            className="group cursor-pointer relative hover:bg-gray-200 p-2"
          >
            <ListItemPrefix>
              <img src={logoutIcon} className="h-6 w-6" />
            </ListItemPrefix>
            <Typography className="ml-2">Log Out</Typography>
          </ListItem>
        </List>
      </Card>

      {/* Main Content Area */}
      <div className="flex-1">
        {/* Top Navbar */}
        <div className="fixed top-0 left-0 right-0 bg-white p-4 border-b border-gray-300 shadow-md z-20">
          <div className="flex justify-between items-center">
            <button onClick={toggleSidebar} className="lg:hidden">
              <Bars3Icon className="h-6 w-6 text-gray-600" />
            </button>
            <div className="flex-1"></div>
            <div className="flex items-center space-x-4">
              {/* Bell Icon */}
              <div className="relative">
                <div
                  className="bg-gray-200 p-2 rounded-full cursor-pointer"
                  onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                >
                  <BellIcon className="h-6 w-6 text-[#D3B094]" />
                </div>
                {unreadCount > 0 && (
                  <div className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}
                {isNotificationsOpen && (
                  <div className="absolute top-10 right-0 bg-white p-4 border border-[#D3B094] rounded-lg shadow-md w-120 z-20">
                    <Typography
                      variant="h6"
                      className="font-semibold text-lg text-[#724E2C]"
                    >
                      Notifications
                    </Typography>
                    <div className="space-y-2 mt-2 max-h-96 overflow-y-scroll">
                      {notifications.slice(0, limit).map((notification) => (
                        <div
                          key={notification.id}
                          className={`flex justify-between items-center cursor-pointer p-2 rounded-md transition-all duration-200 ${
                            notification.status === "unread"
                              ? "bg-gradient-to-r from-green-50 via-green-200 to-green-100 "
                              : "bg-green-50 hover:bg-green-100"
                          }`}
                          onClick={() =>
                            handleNotificationClick(notification.id)
                          }
                        >
                          <span
                            className={`inline-block w-2.5 h-2.5 mr-2 rounded-full ${
                              notification.status === "unread"
                                ? "bg-orange-500"
                                : "bg-gray-500"
                            }`}
                          ></span>
                          <span
                            className={`text-sm ${
                              notification.status === "unread"
                                ? "font-semibold text-[#724E2C]"
                                : "text-gray-600"
                            }`}
                          >
                            {notification.message}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(
                              notification.timestamp.seconds * 1000
                            ).toLocaleTimeString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* User Name and Profile Image */}
              <div className="flex flex-col items-start">
                <Typography className="text-gray-800 font-semibold">
                  {userData
                    ? `${userData.firstName} ${userData.lastName}`
                    : "Neil Delante"}
                </Typography>
                <Typography className="text-gray-500 text-sm">Admin</Typography>
              </div>

              <div className="p-2 rounded-full">
                <img
                  src={profile}
                  alt="Profile"
                  className="h-11 w-11 rounded-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content Display */}
        <div className="pt-25 p-8 w-[84%] relative md:left-0  overflow-x-hidden lg:left-50 bg-gray-100">
          {activeContent}
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-[rgba(0,0,0,0.1)] bg-opacity-30 z-30">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <Typography variant="h6" className="text-center">
              Are you sure you want to log out?
            </Typography>
            <div className="flex justify-around mt-4">
              <button
                onClick={handleCancelLogout}
                className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={logOutConfirm}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
