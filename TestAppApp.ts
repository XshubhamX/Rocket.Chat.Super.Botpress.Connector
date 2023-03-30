import {
    IAppAccessors,
    IConfigurationExtend,
    IHttp,
    ILogger,
    IModify,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { UserNotAllowedException } from "@rocket.chat/apps-engine/definition/exceptions";
import { App } from "@rocket.chat/apps-engine/definition/App";
import { IAppInfo } from "@rocket.chat/apps-engine/definition/metadata";
import { ListBots } from "./Commands/ListBots";
import {
    ButtonStyle,
    IOptionObject,
    TextObjectType,
} from "@rocket.chat/apps-engine/definition/uikit";
import { AppSetting, settings } from "./config/Settings";
import axios from "axios";

import { IUIKitContextualBarViewParam } from "@rocket.chat/apps-engine/definition/uikit/UIKitInteractionResponder";

import {
    IUIKitResponse,
    UIKitActionButtonInteractionContext,
    UIKitViewSubmitInteractionContext,
    UIKitBlockInteractionContext,
} from "@rocket.chat/apps-engine/definition/uikit";

import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";
import {
    IPreRoomUserJoined,
    IRoomUserJoinedContext,
} from "@rocket.chat/apps-engine/definition/rooms";
import {
    IMessage,
    IPostMessageSent,
} from "@rocket.chat/apps-engine/definition/messages";

const bot_config = {
    bot_username: {
        ui_label: "Botpress username *",
        variable: "bot_username",
        placeholder: "",
        required: true,
    },
    botpress_bot_id: {
        ui_label: "Botpress bot id *",
        variable: "bot_id",
        placeholder: "",
        required: true,
    },
    bot_server_url: {
        ui_label: "Botpress server URL *",
        variable: "bot_server_url",
        placeholder: "",
        required: true,
    },
    unavailable_message: {
        ui_label: "Service unavailable message",
        variable: "unavailable_message",
        placeholder: "",
        required: false,
    },
    private: {
        ui_label: "Private bot(will only be available in this channel",
        variable: "private",
        placeholder: "",
        required: true,
    },
};

function generatePrimatyKey() {
    return "1234";
}

export class BotApp extends App implements IPostMessageSent {
    private readonly appLogger: ILogger;
    constructor(info: IAppInfo, logger: ILogger, accessors: IAppAccessors) {
        super(info, logger, accessors);
    }

    public associations: Array<RocketChatAssociationRecord> = [];

    public async extendConfiguration(
        configuration: IConfigurationExtend
    ): Promise<void> {
        const ListBotsCommand: ListBots = new ListBots();
        await configuration.slashCommands.provideSlashCommand(ListBotsCommand);

        await Promise.all(
            settings.map((setting) =>
                configuration.settings.provideSetting(setting)
            )
        );
    }

    public async executeBlockActionHandler(
        context: UIKitBlockInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<IUIKitResponse> {
        const blocks = modify.getCreator().getBlockBuilder();

        Object.keys(bot_config).map((congig_vars) => {
            blocks.addInputBlock({
                blockId:
                    AppSetting.NAMESPACE + bot_config[congig_vars]["variable"],
                label: {
                    text: bot_config[congig_vars]["ui_label"],
                    type: TextObjectType.PLAINTEXT,
                },
                element: blocks.newPlainTextInputElement({
                    actionId: bot_config[congig_vars]["variable"],
                    initialValue: bot_config[congig_vars]["placeholder"],
                }),
            });
        });

        const chat_area: Array<string> = ["Direct", "Omnichannel", "Channel"];

        const options_object: Array<IOptionObject> = chat_area.map(
            (area: string): IOptionObject => {
                return {
                    text: {
                        type: TextObjectType.PLAINTEXT,
                        text: area,
                    },
                    value: area.toLowerCase(),
                };
            }
        );

        blocks.addInputBlock({
            blockId: AppSetting.NAMESPACE + "_SCOPE_OPTIONS",
            optional: false,
            element: blocks.newMultiStaticElement({
                placeholder: blocks.newPlainTextObject("Define scope"),
                actionId: "scope_options",
                initialValue: chat_area,
                options: options_object,
            }),
            label: blocks.newPlainTextObject("Output"),
        });

        const create_update_bot = {
            id: AppSetting.NAMESPACE + "_main_creation_view",
            title: blocks.newPlainTextObject("Bot Settings"),
            blocks: blocks.getBlocks(),
            submit: blocks.newButtonElement({
                actionId: "main_creation_view_submitted",
                text: blocks.newPlainTextObject("Save"),
                value: "as-thread",
                style: ButtonStyle.PRIMARY,
            }),
        };

        return context
            .getInteractionResponder()
            .openModalViewResponse(create_update_bot);
    }

    public async executeViewSubmitHandler(
        context: UIKitViewSubmitInteractionContext,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ) {
        const local_logger = this.getLogger();

        const viewInteractionData = context.getInteractionData();

        if (
            viewInteractionData.view?.id ==
            AppSetting.NAMESPACE + "_main_creation_view"
        ) {
            let newBotData = {},
                primary_key_id = generatePrimatyKey();

            const validatedInteractionData: object =
                viewInteractionData.view?.state || {};

            local_logger.info(validatedInteractionData);

            Object.keys(validatedInteractionData).map((inputFieldData) => {
                const labelObject = validatedInteractionData[inputFieldData];
                newBotData = {
                    ...newBotData,
                    ...labelObject,
                };
            });

            local_logger.info(newBotData, primary_key_id);

            const deleteBotAssociation = new RocketChatAssociationRecord(
                RocketChatAssociationModel.MISC,
                primary_key_id
            );

            // await persistence.updateByAssociation(
            //     newBotAssociation,
            //     newBotData
            // );

            // const

            await persistence.removeByAssociation(deleteBotAssociation);

            const persistenceReader = read.getPersistenceReader();

            const fetchBotsAssociation = new RocketChatAssociationRecord(
                RocketChatAssociationModel.MISC,
                "abcd1234"
            );

            const record: any = (
                await persistenceReader.readByAssociation(fetchBotsAssociation)
            )[0];
        }
    }

    // public async executePreRoomUserJoined(
    //     context: IRoomUserJoinedContext,
    //     read: IRead,
    //     http: IHttp,
    //     persistence: IPersistence
    // ): Promise<void> {
    //     this.getLogger().info("Successful Execution");

    //     throw new UserNotAllowedException("User not allowed to");
    // }

    public async executePostMessageSent(
        message: IMessage,
        read: IRead,
        http: IHttp,
        persistence: IPersistence,
        modify: IModify
    ): Promise<void> {
        //fetch bot data from username

        const persistenceReader = read.getPersistenceReader();

        const threadId = message.threadId ? message.threadId : message.id;

        if (!threadId) return;

        let bot_username = "",
            required_text = "";
        message.text?.split(" ").map((block) => {
            if (block.startsWith("@")) {
                bot_username = block.slice(1);
            } else {
                required_text += block;
            }
        });

        const fetchBotsAssociation = new RocketChatAssociationRecord(
            RocketChatAssociationModel.MISC,
            bot_username
        );

        const requiredBot = (
            await persistenceReader.readByAssociation(fetchBotsAssociation)
        )[0];

        if (!requiredBot) {
            return;
        }

        // build url and send request

        const botpressServerUrl = requiredBot["server_url"];
        const BotpressBotId = requiredBot["bot_id"];

        const httpRequestContent = {
            headers: { "Content-Type": "application/json" },
            data: { text: required_text },
        };

        const room_id = message.room.id;

        const botpressWebhookUrl = `${botpressServerUrl}/api/v1/bots/${BotpressBotId}/converse/${room_id}`;
        const response = await http.post(
            botpressWebhookUrl,
            httpRequestContent
        );
        if (response.statusCode !== 200) {
            throw Error(
                `Error communicating with ${response.content} ${botpressServerUrl}`
            );
        }

        //send message in thread

        await modify.getCreator().startMessage().setRoom(message.room);
    }
}
