import React, { Fragment } from "react";

import Image from "next/image";

// hooks
import useTheme from "hooks/use-theme";

import { Popover, Transition, Menu } from "@headlessui/react";

// hooks
import useUserNotification from "hooks/use-user-notifications";

// components
import { Spinner, Icon } from "components/ui";
import { SnoozeNotificationModal, NotificationCard } from "components/notifications";

// type
import type { NotificationType } from "types";

const notificationTabs: Array<{
  label: string;
  value: NotificationType;
}> = [
  {
    label: "My Issues",
    value: "assigned",
  },
  {
    label: "Created by me",
    value: "created",
  },
  {
    label: "Subscribed",
    value: "watching",
  },
];

export const NotificationPopover = () => {
  const {
    notifications,
    archived,
    readNotification,
    selectedNotificationForSnooze,
    selectedTab,
    setArchived,
    setReadNotification,
    setSelectedNotificationForSnooze,
    setSelectedTab,
    setSnoozed,
    snoozed,
    notificationsMutate,
    markNotificationArchivedStatus,
    markNotificationReadStatus,
    markSnoozeNotification,
  } = useUserNotification();

  // theme context
  const { collapsed: sidebarCollapse } = useTheme();

  return (
    <>
      <SnoozeNotificationModal
        isOpen={selectedNotificationForSnooze !== null}
        onClose={() => setSelectedNotificationForSnooze(null)}
        onSubmit={markSnoozeNotification}
        notification={
          notifications?.find(
            (notification) => notification.id === selectedNotificationForSnooze
          ) || null
        }
        onSuccess={() => {
          notificationsMutate();
          setSelectedNotificationForSnooze(null);
        }}
      />
      <Popover className="relative w-full">
        {({ open: isActive, close: closePopover }) => (
          <>
            <Popover.Button
              className={`group flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium outline-none ${
                isActive
                  ? "bg-custom-primary-100/10 text-custom-primary-100"
                  : "text-custom-sidebar-text-200 hover:bg-custom-sidebar-background-80 focus:bg-custom-sidebar-background-80"
              } ${sidebarCollapse ? "justify-center" : ""}`}
            >
              <Icon iconName="notifications" />
              {sidebarCollapse ? null : <span>Notifications</span>}
            </Popover.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-200"
              enterFrom="opacity-0 translate-y-1"
              enterTo="opacity-100 translate-y-0"
              leave="transition ease-in duration-150"
              leaveFrom="opacity-100 translate-y-0"
              leaveTo="opacity-0 translate-y-1"
            >
              <Popover.Panel className="absolute bg-custom-background-100 flex flex-col left-0 md:left-full z-10 mt-3 pt-5 md:w-[36rem] w-[20rem] h-[30rem] border border-custom-background-90 shadow-lg rounded">
                <div className="flex justify-between items-center md:px-6 px-2">
                  <h2 className="text-custom-sidebar-text-100 text-lg font-semibold mb-2">
                    Notifications
                  </h2>
                  <div className="flex gap-x-2 justify-center items-center">
                    <button
                      type="button"
                      onClick={(e) => {
                        notificationsMutate();
                        const target = e.target as HTMLButtonElement;
                        target?.classList.add("animate-spin");
                        setTimeout(() => {
                          target?.classList.remove("animate-spin");
                        }, 1000);
                      }}
                    >
                      <Icon iconName="refresh" className="h-6 w-6 text-custom-text-300" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSnoozed(false);
                        setArchived(false);
                        setReadNotification((prev) => !prev);
                      }}
                    >
                      <Icon iconName="filter_list" className="h-6 w-6 text-custom-text-300" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setArchived(false);
                        setReadNotification(false);
                        setSnoozed((prev) => !prev);
                      }}
                    >
                      <Icon iconName="schedule" className="h-6 w-6 text-custom-text-300" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSnoozed(false);
                        setReadNotification(false);
                        setArchived((prev) => !prev);
                      }}
                    >
                      <Icon iconName="archive" className="h-6 w-6 text-custom-text-300" />
                    </button>
                    <button type="button" onClick={() => closePopover()}>
                      <Icon iconName="close" className="h-6 w-6 text-custom-text-300" />
                    </button>
                  </div>
                </div>

                <div className="mt-5 flex flex-col items-center">
                  {snoozed || archived || readNotification ? (
                    <div className="w-full mb-3">
                      <div className="flex flex-col flex-1 px-2 md:px-6 overflow-y-auto">
                        <button
                          type="button"
                          onClick={() => {
                            setSnoozed(false);
                            setArchived(false);
                            setReadNotification(false);
                          }}
                        >
                          <h4 className="text-custom-text-300 text-center flex items-center">
                            <Icon iconName="arrow_back" className="h-5 w-5 text-custom-text-300" />
                            <span className="ml-2 font-semibold">
                              {snoozed
                                ? "Snoozed Notifications"
                                : readNotification
                                ? "Read Notifications"
                                : "Archived Notifications"}
                            </span>
                          </h4>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-b border-custom-border-300 md:px-6 px-2 w-full">
                      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {notificationTabs.map((tab) => (
                          <button
                            type="button"
                            key={tab.value}
                            onClick={() => setSelectedTab(tab.value)}
                            className={`whitespace-nowrap border-b-2 pb-4 px-1 text-sm font-medium ${
                              tab.value === selectedTab
                                ? "border-custom-primary-100 text-custom-primary-100"
                                : "border-transparent text-custom-text-500 hover:border-custom-border-300 hover:text-custom-text-200"
                            }`}
                          >
                            {tab.label}
                          </button>
                        ))}
                      </nav>
                    </div>
                  )}
                </div>

                <div className="w-full flex-1 overflow-y-auto">
                  {notifications ? (
                    notifications.filter(
                      (notification) => notification.data.issue_activity.field !== "None"
                    ).length > 0 ? (
                      notifications.map((notification) => (
                        <NotificationCard
                          key={notification.id}
                          notification={notification}
                          markNotificationArchivedStatus={markNotificationArchivedStatus}
                          markNotificationReadStatus={markNotificationReadStatus}
                          setSelectedNotificationForSnooze={setSelectedNotificationForSnooze}
                          markSnoozeNotification={markSnoozeNotification}
                        />
                      ))
                    ) : (
                      <div className="flex flex-col w-full h-full justify-center items-center">
                        <Image
                          src="/empty-state/empty-notification.svg"
                          alt="Empty"
                          width={200}
                          height={200}
                          layout="fixed"
                        />
                        <h4 className="text-custom-text-300 text-lg font-semibold">
                          You{"'"}re updated with all the notifications
                        </h4>
                        <p className="text-custom-text-300 text-sm mt-2">
                          You have read all the notifications.
                        </p>
                      </div>
                    )
                  ) : (
                    <div className="flex w-full h-full justify-center items-center">
                      <Spinner />
                    </div>
                  )}
                </div>
              </Popover.Panel>
            </Transition>
          </>
        )}
      </Popover>
    </>
  );
};