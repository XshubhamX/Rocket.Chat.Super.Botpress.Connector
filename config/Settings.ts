import {
    ISetting,
    SettingType,
} from "@rocket.chat/apps-engine/definition/settings";

export enum AppSetting {
    NAMESPACE = "QuestionAnswerApp",
    CREATE_PERMISSION = "create_permission",
    ADD_PERMISSION = "add_permission",
    UPDATE_PERMISSION = "update_permission",
    DELETE_PERMISSION = "delete_permission",
}

export const settings: Array<ISetting> = [
    {
        id: AppSetting.CREATE_PERMISSION,
        public: true,
        type: SettingType.MULTI_SELECT,
        packageValue: "",
        i18nLabel: "Create Bot Permission",
        required: true,
        values: [
            {
                i18nLabel: "Admin",
                key: "admin",
            },
            {
                i18nLabel: "Owner",
                key: "owner",
            },
            {
                i18nLabel: "Moderator",
                key: "moderator",
            },
            {
                i18nLabel: "User",
                key: "user",
            },
        ],
    },
    {
        id: AppSetting.ADD_PERMISSION,
        public: true,
        type: SettingType.MULTI_SELECT,
        packageValue: "",
        i18nLabel: "Add Bot Permission",
        required: true,
        values: [
            {
                i18nLabel: "Admin",
                key: "admin",
            },
            {
                i18nLabel: "Owner",
                key: "owner",
            },
            {
                i18nLabel: "Moderator",
                key: "moderator",
            },
            {
                i18nLabel: "User",
                key: "user",
            },
        ],
    },
    {
        id: AppSetting.UPDATE_PERMISSION,
        public: true,
        type: SettingType.MULTI_SELECT,
        packageValue: "",
        i18nLabel: "Update Bot Permission",
        required: true,
        values: [
            {
                i18nLabel: "Admin",
                key: "admin",
            },
            {
                i18nLabel: "Owner",
                key: "owner",
            },
            {
                i18nLabel: "Moderator",
                key: "moderator",
            },
            {
                i18nLabel: "User",
                key: "user",
            },
        ],
    },
    {
        id: AppSetting.DELETE_PERMISSION,
        public: true,
        type: SettingType.MULTI_SELECT,
        packageValue: "",
        i18nLabel: "Delete Bot Permission",
        required: true,
        values: [
            {
                i18nLabel: "Admin",
                key: "admin",
            },
            {
                i18nLabel: "Owner",
                key: "owner",
            },
            {
                i18nLabel: "Moderator",
                key: "moderator",
            },
            {
                i18nLabel: "User",
                key: "user",
            },
        ],
    },
];
