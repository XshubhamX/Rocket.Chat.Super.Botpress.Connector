import {
    IHttp,
    IMessageBuilder,
    IModify,
    IModifyCreator,
    IPersistence,
    IRead,
} from "@rocket.chat/apps-engine/definition/accessors";
import { IMessage } from "@rocket.chat/apps-engine/definition/messages";
import { IRoom } from "@rocket.chat/apps-engine/definition/rooms";
import {
    ISlashCommand,
    SlashCommandContext,
} from "@rocket.chat/apps-engine/definition/slashcommands";
import { IUser } from "@rocket.chat/apps-engine/definition/users";
import { AppSetting } from "../config/Settings";
import { ButtonStyle } from "@rocket.chat/apps-engine/definition/uikit";

import {
    RocketChatAssociationModel,
    RocketChatAssociationRecord,
} from "@rocket.chat/apps-engine/definition/metadata";

export class ListBots implements ISlashCommand {
    public command = "hello";
    public i18nDescription = "";
    public providesPreview = false;
    public i18nParamsExample = "";

    public async executor(
        context: SlashCommandContext,
        read: IRead,
        modify: IModify,
        http: IHttp,
        persis: IPersistence
    ): Promise<void> {
        const triggerId = context.getTriggerId() as string; // [1]
        const user = context.getSender();
        const room = context.getRoom();
        const block = modify.getCreator().getBlockBuilder();

        const persistenceReader = read.getPersistenceReader();

        const builder = await modify.getCreator().startMessage().setRoom(room);
        block.addSectionBlock({
            text: block.newPlainTextObject("Choose a bot from below to edit "),
        });

        const fetchBotsAssociation = new RocketChatAssociationRecord(
            RocketChatAssociationModel.MISC,
            "abcd1234"
        );

        const records: any = await persistenceReader.readByAssociation(
            fetchBotsAssociation
        );

        const bots = ["shubham", "duda"];

        const elements: any[] = [];

        bots.forEach((element) => {
            elements.push(
                block.newButtonElement({
                    actionId: "ChuckNorrisCategorySelect",
                    text: block.newPlainTextObject(element),
                    value: element,
                    style: ButtonStyle.DANGER,
                })
            );
        });

        elements.push(
            block.newButtonElement({
                actionId: "ddeded",
                text: block.newPlainTextObject("Create"),
                value: "shubham",
                style: ButtonStyle.PRIMARY,
            })
        );

        block.addActionsBlock({
            blockId: "allbots",
            elements: elements,
        });

        builder.setBlocks(block);

        await modify.getNotifier().notifyUser(user, builder.getMessage());
    }

    private async sendMessage(
        context: SlashCommandContext,
        modify: IModify,
        message: string
    ): Promise<void> {
        const messageStructure = modify.getCreator().startMessage();
        const sender = context.getSender();
        const room = context.getRoom();

        messageStructure.setSender(sender).setRoom(room).setText(message);

        await modify.getCreator().finish(messageStructure);
    }
}
