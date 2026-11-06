import { createTRPCRouter, premuiumprocedure, protectedProcedure } from "@/trpc/init";
import { db } from "@/db";
import { agents, meetings } from "@/db/schema";
import { AgentSchema, AgentUpdateSchema } from "../schemas";
import { z } from "zod";
import { and, count, desc, eq, getTableColumns, like } from "drizzle-orm";
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE, MIN_PAGE_SIZE } from "@/constants";
import { TRPCError } from "@trpc/server";

export const agentsRouter = createTRPCRouter({
    update: protectedProcedure
    .input(AgentUpdateSchema)
    .mutation(async ({ input, ctx }) => {
        const [UpdateAgent] = await db
        .update(agents)
        .set(input)
        .where(
            and(
                eq(agents.id, input.id),
                eq(agents.userId, ctx.auth.user.id)
            )     
        ).returning();

        if(!UpdateAgent) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found"});
        }
        
        return UpdateAgent;
    }),
    remove: protectedProcedure
    .input(
        z.object({ 
            id: z.string() 
        })
    ).mutation(async ({ input, ctx }) => {
        const [removeagent] = await db.delete(agents).where(
            and(
                eq(agents.id, input.id),
                eq(agents.userId, ctx.auth.user.id)
            ),  
        )
        .returning();

        if(!removeagent) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found"});
        }
        
        return removeagent;
    }),
    getMany: protectedProcedure
    .input(
        z.object({ 
            search: z.string().nullish(),
            page: z.number().min(MIN_PAGE_SIZE).default(DEFAULT_PAGE),
            pageSize: z.number().min(MIN_PAGE_SIZE).max(MAX_PAGE_SIZE).default(DEFAULT_PAGE_SIZE),
        })
    )
    .query(async ({ ctx, input}) => {
        const { search, page, pageSize } = input;

        const data = await db
        .select({
            ...getTableColumns(agents),
            meetingsCount: db.$count(meetings, eq(meetings.agentId, agents.id)),
        })
        .from(agents)
        .where(
            and(
                eq(agents.userId, ctx.auth.user.id),
                search ? like(agents.name, `%${search}%`) : undefined,
            )
        )
        .orderBy(desc(agents.createdAt), desc(agents.id))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

        const total = await db
        .select({
            count: count(),
        })
        .from(agents)
        .where(
            and(
                eq(agents.userId, ctx.auth.user.id),
                search ? like(agents.name, `%${search}%`) : undefined,
            )
        )
        
        const totalPages = Math.ceil(total[0].count / pageSize);

        return { 
            items:data, 
            total: total[0].count, 
            totalPages };
    }),
    getOne: protectedProcedure
    .input(
        z.object({ id: z.string()})
    )
    .query(async ({ input, ctx }) => {
        const [existingAgent] = await db
        .select({
            ...getTableColumns(agents),
            meetingsCount: db.$count(meetings, eq(meetings.agentId, agents.id)),
        })
        .from(agents)
        .where(
            and(
                eq(agents.id, input.id),
                eq(agents.userId, ctx.auth.user.id)
            )
        );

        if (!existingAgent) {
            throw new TRPCError({ code: "NOT_FOUND", message: "Agent not found"});
        }


        return existingAgent;
    }),
    create: premuiumprocedure('agents')
    .input(AgentSchema)
    .mutation(async ({ input, ctx }) => {
        const [createdAgent] = await db
        .insert(agents)
        .values({
            ...input,
            instructions: input.Instructions,
            userId: ctx.auth.user.id,
        })
        .returning();

        return createdAgent;
    }),
});