import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
/**
 * Model UsageLog
 *
 */
export type UsageLogModel = runtime.Types.Result.DefaultSelection<Prisma.$UsageLogPayload>;
export type AggregateUsageLog = {
    _count: UsageLogCountAggregateOutputType | null;
    _avg: UsageLogAvgAggregateOutputType | null;
    _sum: UsageLogSumAggregateOutputType | null;
    _min: UsageLogMinAggregateOutputType | null;
    _max: UsageLogMaxAggregateOutputType | null;
};
export type UsageLogAvgAggregateOutputType = {
    promptTokens: number | null;
    completionTokens: number | null;
    totalTokens: number | null;
    latency: number | null;
};
export type UsageLogSumAggregateOutputType = {
    promptTokens: number | null;
    completionTokens: number | null;
    totalTokens: number | null;
    latency: number | null;
};
export type UsageLogMinAggregateOutputType = {
    id: string | null;
    createdAt: Date | null;
    source: string | null;
    model: string | null;
    provider: string | null;
    promptTokens: number | null;
    completionTokens: number | null;
    totalTokens: number | null;
    latency: number | null;
    success: boolean | null;
    error: string | null;
    callerIp: string | null;
};
export type UsageLogMaxAggregateOutputType = {
    id: string | null;
    createdAt: Date | null;
    source: string | null;
    model: string | null;
    provider: string | null;
    promptTokens: number | null;
    completionTokens: number | null;
    totalTokens: number | null;
    latency: number | null;
    success: boolean | null;
    error: string | null;
    callerIp: string | null;
};
export type UsageLogCountAggregateOutputType = {
    id: number;
    createdAt: number;
    source: number;
    model: number;
    provider: number;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latency: number;
    success: number;
    error: number;
    callerIp: number;
    _all: number;
};
export type UsageLogAvgAggregateInputType = {
    promptTokens?: true;
    completionTokens?: true;
    totalTokens?: true;
    latency?: true;
};
export type UsageLogSumAggregateInputType = {
    promptTokens?: true;
    completionTokens?: true;
    totalTokens?: true;
    latency?: true;
};
export type UsageLogMinAggregateInputType = {
    id?: true;
    createdAt?: true;
    source?: true;
    model?: true;
    provider?: true;
    promptTokens?: true;
    completionTokens?: true;
    totalTokens?: true;
    latency?: true;
    success?: true;
    error?: true;
    callerIp?: true;
};
export type UsageLogMaxAggregateInputType = {
    id?: true;
    createdAt?: true;
    source?: true;
    model?: true;
    provider?: true;
    promptTokens?: true;
    completionTokens?: true;
    totalTokens?: true;
    latency?: true;
    success?: true;
    error?: true;
    callerIp?: true;
};
export type UsageLogCountAggregateInputType = {
    id?: true;
    createdAt?: true;
    source?: true;
    model?: true;
    provider?: true;
    promptTokens?: true;
    completionTokens?: true;
    totalTokens?: true;
    latency?: true;
    success?: true;
    error?: true;
    callerIp?: true;
    _all?: true;
};
export type UsageLogAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which UsageLog to aggregate.
     */
    where?: Prisma.UsageLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UsageLogs to fetch.
     */
    orderBy?: Prisma.UsageLogOrderByWithRelationInput | Prisma.UsageLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the start position
     */
    cursor?: Prisma.UsageLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UsageLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UsageLogs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Count returned UsageLogs
    **/
    _count?: true | UsageLogCountAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to average
    **/
    _avg?: UsageLogAvgAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to sum
    **/
    _sum?: UsageLogSumAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the minimum value
    **/
    _min?: UsageLogMinAggregateInputType;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     *
     * Select which fields to find the maximum value
    **/
    _max?: UsageLogMaxAggregateInputType;
};
export type GetUsageLogAggregateType<T extends UsageLogAggregateArgs> = {
    [P in keyof T & keyof AggregateUsageLog]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateUsageLog[P]> : Prisma.GetScalarType<T[P], AggregateUsageLog[P]>;
};
export type UsageLogGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.UsageLogWhereInput;
    orderBy?: Prisma.UsageLogOrderByWithAggregationInput | Prisma.UsageLogOrderByWithAggregationInput[];
    by: Prisma.UsageLogScalarFieldEnum[] | Prisma.UsageLogScalarFieldEnum;
    having?: Prisma.UsageLogScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: UsageLogCountAggregateInputType | true;
    _avg?: UsageLogAvgAggregateInputType;
    _sum?: UsageLogSumAggregateInputType;
    _min?: UsageLogMinAggregateInputType;
    _max?: UsageLogMaxAggregateInputType;
};
export type UsageLogGroupByOutputType = {
    id: string;
    createdAt: Date;
    source: string;
    model: string;
    provider: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latency: number;
    success: boolean;
    error: string | null;
    callerIp: string | null;
    _count: UsageLogCountAggregateOutputType | null;
    _avg: UsageLogAvgAggregateOutputType | null;
    _sum: UsageLogSumAggregateOutputType | null;
    _min: UsageLogMinAggregateOutputType | null;
    _max: UsageLogMaxAggregateOutputType | null;
};
type GetUsageLogGroupByPayload<T extends UsageLogGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<UsageLogGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof UsageLogGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], UsageLogGroupByOutputType[P]> : Prisma.GetScalarType<T[P], UsageLogGroupByOutputType[P]>;
}>>;
export type UsageLogWhereInput = {
    AND?: Prisma.UsageLogWhereInput | Prisma.UsageLogWhereInput[];
    OR?: Prisma.UsageLogWhereInput[];
    NOT?: Prisma.UsageLogWhereInput | Prisma.UsageLogWhereInput[];
    id?: Prisma.StringFilter<"UsageLog"> | string;
    createdAt?: Prisma.DateTimeFilter<"UsageLog"> | Date | string;
    source?: Prisma.StringFilter<"UsageLog"> | string;
    model?: Prisma.StringFilter<"UsageLog"> | string;
    provider?: Prisma.StringFilter<"UsageLog"> | string;
    promptTokens?: Prisma.IntFilter<"UsageLog"> | number;
    completionTokens?: Prisma.IntFilter<"UsageLog"> | number;
    totalTokens?: Prisma.IntFilter<"UsageLog"> | number;
    latency?: Prisma.IntFilter<"UsageLog"> | number;
    success?: Prisma.BoolFilter<"UsageLog"> | boolean;
    error?: Prisma.StringNullableFilter<"UsageLog"> | string | null;
    callerIp?: Prisma.StringNullableFilter<"UsageLog"> | string | null;
};
export type UsageLogOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    model?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    promptTokens?: Prisma.SortOrder;
    completionTokens?: Prisma.SortOrder;
    totalTokens?: Prisma.SortOrder;
    latency?: Prisma.SortOrder;
    success?: Prisma.SortOrder;
    error?: Prisma.SortOrderInput | Prisma.SortOrder;
    callerIp?: Prisma.SortOrderInput | Prisma.SortOrder;
};
export type UsageLogWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.UsageLogWhereInput | Prisma.UsageLogWhereInput[];
    OR?: Prisma.UsageLogWhereInput[];
    NOT?: Prisma.UsageLogWhereInput | Prisma.UsageLogWhereInput[];
    createdAt?: Prisma.DateTimeFilter<"UsageLog"> | Date | string;
    source?: Prisma.StringFilter<"UsageLog"> | string;
    model?: Prisma.StringFilter<"UsageLog"> | string;
    provider?: Prisma.StringFilter<"UsageLog"> | string;
    promptTokens?: Prisma.IntFilter<"UsageLog"> | number;
    completionTokens?: Prisma.IntFilter<"UsageLog"> | number;
    totalTokens?: Prisma.IntFilter<"UsageLog"> | number;
    latency?: Prisma.IntFilter<"UsageLog"> | number;
    success?: Prisma.BoolFilter<"UsageLog"> | boolean;
    error?: Prisma.StringNullableFilter<"UsageLog"> | string | null;
    callerIp?: Prisma.StringNullableFilter<"UsageLog"> | string | null;
}, "id">;
export type UsageLogOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    model?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    promptTokens?: Prisma.SortOrder;
    completionTokens?: Prisma.SortOrder;
    totalTokens?: Prisma.SortOrder;
    latency?: Prisma.SortOrder;
    success?: Prisma.SortOrder;
    error?: Prisma.SortOrderInput | Prisma.SortOrder;
    callerIp?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.UsageLogCountOrderByAggregateInput;
    _avg?: Prisma.UsageLogAvgOrderByAggregateInput;
    _max?: Prisma.UsageLogMaxOrderByAggregateInput;
    _min?: Prisma.UsageLogMinOrderByAggregateInput;
    _sum?: Prisma.UsageLogSumOrderByAggregateInput;
};
export type UsageLogScalarWhereWithAggregatesInput = {
    AND?: Prisma.UsageLogScalarWhereWithAggregatesInput | Prisma.UsageLogScalarWhereWithAggregatesInput[];
    OR?: Prisma.UsageLogScalarWhereWithAggregatesInput[];
    NOT?: Prisma.UsageLogScalarWhereWithAggregatesInput | Prisma.UsageLogScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"UsageLog"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"UsageLog"> | Date | string;
    source?: Prisma.StringWithAggregatesFilter<"UsageLog"> | string;
    model?: Prisma.StringWithAggregatesFilter<"UsageLog"> | string;
    provider?: Prisma.StringWithAggregatesFilter<"UsageLog"> | string;
    promptTokens?: Prisma.IntWithAggregatesFilter<"UsageLog"> | number;
    completionTokens?: Prisma.IntWithAggregatesFilter<"UsageLog"> | number;
    totalTokens?: Prisma.IntWithAggregatesFilter<"UsageLog"> | number;
    latency?: Prisma.IntWithAggregatesFilter<"UsageLog"> | number;
    success?: Prisma.BoolWithAggregatesFilter<"UsageLog"> | boolean;
    error?: Prisma.StringNullableWithAggregatesFilter<"UsageLog"> | string | null;
    callerIp?: Prisma.StringNullableWithAggregatesFilter<"UsageLog"> | string | null;
};
export type UsageLogCreateInput = {
    id?: string;
    createdAt?: Date | string;
    source: string;
    model: string;
    provider: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    latency?: number;
    success?: boolean;
    error?: string | null;
    callerIp?: string | null;
};
export type UsageLogUncheckedCreateInput = {
    id?: string;
    createdAt?: Date | string;
    source: string;
    model: string;
    provider: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    latency?: number;
    success?: boolean;
    error?: string | null;
    callerIp?: string | null;
};
export type UsageLogUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    source?: Prisma.StringFieldUpdateOperationsInput | string;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.StringFieldUpdateOperationsInput | string;
    promptTokens?: Prisma.IntFieldUpdateOperationsInput | number;
    completionTokens?: Prisma.IntFieldUpdateOperationsInput | number;
    totalTokens?: Prisma.IntFieldUpdateOperationsInput | number;
    latency?: Prisma.IntFieldUpdateOperationsInput | number;
    success?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    error?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    callerIp?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type UsageLogUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    source?: Prisma.StringFieldUpdateOperationsInput | string;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.StringFieldUpdateOperationsInput | string;
    promptTokens?: Prisma.IntFieldUpdateOperationsInput | number;
    completionTokens?: Prisma.IntFieldUpdateOperationsInput | number;
    totalTokens?: Prisma.IntFieldUpdateOperationsInput | number;
    latency?: Prisma.IntFieldUpdateOperationsInput | number;
    success?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    error?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    callerIp?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type UsageLogCreateManyInput = {
    id?: string;
    createdAt?: Date | string;
    source: string;
    model: string;
    provider: string;
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
    latency?: number;
    success?: boolean;
    error?: string | null;
    callerIp?: string | null;
};
export type UsageLogUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    source?: Prisma.StringFieldUpdateOperationsInput | string;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.StringFieldUpdateOperationsInput | string;
    promptTokens?: Prisma.IntFieldUpdateOperationsInput | number;
    completionTokens?: Prisma.IntFieldUpdateOperationsInput | number;
    totalTokens?: Prisma.IntFieldUpdateOperationsInput | number;
    latency?: Prisma.IntFieldUpdateOperationsInput | number;
    success?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    error?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    callerIp?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type UsageLogUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    source?: Prisma.StringFieldUpdateOperationsInput | string;
    model?: Prisma.StringFieldUpdateOperationsInput | string;
    provider?: Prisma.StringFieldUpdateOperationsInput | string;
    promptTokens?: Prisma.IntFieldUpdateOperationsInput | number;
    completionTokens?: Prisma.IntFieldUpdateOperationsInput | number;
    totalTokens?: Prisma.IntFieldUpdateOperationsInput | number;
    latency?: Prisma.IntFieldUpdateOperationsInput | number;
    success?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    error?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    callerIp?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
};
export type UsageLogCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    model?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    promptTokens?: Prisma.SortOrder;
    completionTokens?: Prisma.SortOrder;
    totalTokens?: Prisma.SortOrder;
    latency?: Prisma.SortOrder;
    success?: Prisma.SortOrder;
    error?: Prisma.SortOrder;
    callerIp?: Prisma.SortOrder;
};
export type UsageLogAvgOrderByAggregateInput = {
    promptTokens?: Prisma.SortOrder;
    completionTokens?: Prisma.SortOrder;
    totalTokens?: Prisma.SortOrder;
    latency?: Prisma.SortOrder;
};
export type UsageLogMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    model?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    promptTokens?: Prisma.SortOrder;
    completionTokens?: Prisma.SortOrder;
    totalTokens?: Prisma.SortOrder;
    latency?: Prisma.SortOrder;
    success?: Prisma.SortOrder;
    error?: Prisma.SortOrder;
    callerIp?: Prisma.SortOrder;
};
export type UsageLogMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    source?: Prisma.SortOrder;
    model?: Prisma.SortOrder;
    provider?: Prisma.SortOrder;
    promptTokens?: Prisma.SortOrder;
    completionTokens?: Prisma.SortOrder;
    totalTokens?: Prisma.SortOrder;
    latency?: Prisma.SortOrder;
    success?: Prisma.SortOrder;
    error?: Prisma.SortOrder;
    callerIp?: Prisma.SortOrder;
};
export type UsageLogSumOrderByAggregateInput = {
    promptTokens?: Prisma.SortOrder;
    completionTokens?: Prisma.SortOrder;
    totalTokens?: Prisma.SortOrder;
    latency?: Prisma.SortOrder;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type UsageLogSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    createdAt?: boolean;
    source?: boolean;
    model?: boolean;
    provider?: boolean;
    promptTokens?: boolean;
    completionTokens?: boolean;
    totalTokens?: boolean;
    latency?: boolean;
    success?: boolean;
    error?: boolean;
    callerIp?: boolean;
}, ExtArgs["result"]["usageLog"]>;
export type UsageLogSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    createdAt?: boolean;
    source?: boolean;
    model?: boolean;
    provider?: boolean;
    promptTokens?: boolean;
    completionTokens?: boolean;
    totalTokens?: boolean;
    latency?: boolean;
    success?: boolean;
    error?: boolean;
    callerIp?: boolean;
}, ExtArgs["result"]["usageLog"]>;
export type UsageLogSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    createdAt?: boolean;
    source?: boolean;
    model?: boolean;
    provider?: boolean;
    promptTokens?: boolean;
    completionTokens?: boolean;
    totalTokens?: boolean;
    latency?: boolean;
    success?: boolean;
    error?: boolean;
    callerIp?: boolean;
}, ExtArgs["result"]["usageLog"]>;
export type UsageLogSelectScalar = {
    id?: boolean;
    createdAt?: boolean;
    source?: boolean;
    model?: boolean;
    provider?: boolean;
    promptTokens?: boolean;
    completionTokens?: boolean;
    totalTokens?: boolean;
    latency?: boolean;
    success?: boolean;
    error?: boolean;
    callerIp?: boolean;
};
export type UsageLogOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "createdAt" | "source" | "model" | "provider" | "promptTokens" | "completionTokens" | "totalTokens" | "latency" | "success" | "error" | "callerIp", ExtArgs["result"]["usageLog"]>;
export type $UsageLogPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "UsageLog";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        createdAt: Date;
        source: string;
        model: string;
        provider: string;
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
        latency: number;
        success: boolean;
        error: string | null;
        callerIp: string | null;
    }, ExtArgs["result"]["usageLog"]>;
    composites: {};
};
export type UsageLogGetPayload<S extends boolean | null | undefined | UsageLogDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$UsageLogPayload, S>;
export type UsageLogCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<UsageLogFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: UsageLogCountAggregateInputType | true;
};
export interface UsageLogDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['UsageLog'];
        meta: {
            name: 'UsageLog';
        };
    };
    /**
     * Find zero or one UsageLog that matches the filter.
     * @param {UsageLogFindUniqueArgs} args - Arguments to find a UsageLog
     * @example
     * // Get one UsageLog
     * const usageLog = await prisma.usageLog.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UsageLogFindUniqueArgs>(args: Prisma.SelectSubset<T, UsageLogFindUniqueArgs<ExtArgs>>): Prisma.Prisma__UsageLogClient<runtime.Types.Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find one UsageLog that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UsageLogFindUniqueOrThrowArgs} args - Arguments to find a UsageLog
     * @example
     * // Get one UsageLog
     * const usageLog = await prisma.usageLog.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UsageLogFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, UsageLogFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__UsageLogClient<runtime.Types.Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first UsageLog that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageLogFindFirstArgs} args - Arguments to find a UsageLog
     * @example
     * // Get one UsageLog
     * const usageLog = await prisma.usageLog.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UsageLogFindFirstArgs>(args?: Prisma.SelectSubset<T, UsageLogFindFirstArgs<ExtArgs>>): Prisma.Prisma__UsageLogClient<runtime.Types.Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    /**
     * Find the first UsageLog that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageLogFindFirstOrThrowArgs} args - Arguments to find a UsageLog
     * @example
     * // Get one UsageLog
     * const usageLog = await prisma.usageLog.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UsageLogFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, UsageLogFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__UsageLogClient<runtime.Types.Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Find zero or more UsageLogs that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageLogFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UsageLogs
     * const usageLogs = await prisma.usageLog.findMany()
     *
     * // Get first 10 UsageLogs
     * const usageLogs = await prisma.usageLog.findMany({ take: 10 })
     *
     * // Only select the `id`
     * const usageLogWithIdOnly = await prisma.usageLog.findMany({ select: { id: true } })
     *
     */
    findMany<T extends UsageLogFindManyArgs>(args?: Prisma.SelectSubset<T, UsageLogFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    /**
     * Create a UsageLog.
     * @param {UsageLogCreateArgs} args - Arguments to create a UsageLog.
     * @example
     * // Create one UsageLog
     * const UsageLog = await prisma.usageLog.create({
     *   data: {
     *     // ... data to create a UsageLog
     *   }
     * })
     *
     */
    create<T extends UsageLogCreateArgs>(args: Prisma.SelectSubset<T, UsageLogCreateArgs<ExtArgs>>): Prisma.Prisma__UsageLogClient<runtime.Types.Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Create many UsageLogs.
     * @param {UsageLogCreateManyArgs} args - Arguments to create many UsageLogs.
     * @example
     * // Create many UsageLogs
     * const usageLog = await prisma.usageLog.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     */
    createMany<T extends UsageLogCreateManyArgs>(args?: Prisma.SelectSubset<T, UsageLogCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Create many UsageLogs and returns the data saved in the database.
     * @param {UsageLogCreateManyAndReturnArgs} args - Arguments to create many UsageLogs.
     * @example
     * // Create many UsageLogs
     * const usageLog = await prisma.usageLog.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Create many UsageLogs and only return the `id`
     * const usageLogWithIdOnly = await prisma.usageLog.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    createManyAndReturn<T extends UsageLogCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, UsageLogCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    /**
     * Delete a UsageLog.
     * @param {UsageLogDeleteArgs} args - Arguments to delete one UsageLog.
     * @example
     * // Delete one UsageLog
     * const UsageLog = await prisma.usageLog.delete({
     *   where: {
     *     // ... filter to delete one UsageLog
     *   }
     * })
     *
     */
    delete<T extends UsageLogDeleteArgs>(args: Prisma.SelectSubset<T, UsageLogDeleteArgs<ExtArgs>>): Prisma.Prisma__UsageLogClient<runtime.Types.Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Update one UsageLog.
     * @param {UsageLogUpdateArgs} args - Arguments to update one UsageLog.
     * @example
     * // Update one UsageLog
     * const usageLog = await prisma.usageLog.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    update<T extends UsageLogUpdateArgs>(args: Prisma.SelectSubset<T, UsageLogUpdateArgs<ExtArgs>>): Prisma.Prisma__UsageLogClient<runtime.Types.Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Delete zero or more UsageLogs.
     * @param {UsageLogDeleteManyArgs} args - Arguments to filter UsageLogs to delete.
     * @example
     * // Delete a few UsageLogs
     * const { count } = await prisma.usageLog.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     *
     */
    deleteMany<T extends UsageLogDeleteManyArgs>(args?: Prisma.SelectSubset<T, UsageLogDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more UsageLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageLogUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UsageLogs
     * const usageLog = await prisma.usageLog.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     *
     */
    updateMany<T extends UsageLogUpdateManyArgs>(args: Prisma.SelectSubset<T, UsageLogUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    /**
     * Update zero or more UsageLogs and returns the data updated in the database.
     * @param {UsageLogUpdateManyAndReturnArgs} args - Arguments to update many UsageLogs.
     * @example
     * // Update many UsageLogs
     * const usageLog = await prisma.usageLog.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *
     * // Update zero or more UsageLogs and only return the `id`
     * const usageLogWithIdOnly = await prisma.usageLog.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     *
     */
    updateManyAndReturn<T extends UsageLogUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, UsageLogUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    /**
     * Create or update one UsageLog.
     * @param {UsageLogUpsertArgs} args - Arguments to update or create a UsageLog.
     * @example
     * // Update or create a UsageLog
     * const usageLog = await prisma.usageLog.upsert({
     *   create: {
     *     // ... data to create a UsageLog
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UsageLog we want to update
     *   }
     * })
     */
    upsert<T extends UsageLogUpsertArgs>(args: Prisma.SelectSubset<T, UsageLogUpsertArgs<ExtArgs>>): Prisma.Prisma__UsageLogClient<runtime.Types.Result.GetResult<Prisma.$UsageLogPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    /**
     * Count the number of UsageLogs.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageLogCountArgs} args - Arguments to filter UsageLogs to count.
     * @example
     * // Count the number of UsageLogs
     * const count = await prisma.usageLog.count({
     *   where: {
     *     // ... the filter for the UsageLogs we want to count
     *   }
     * })
    **/
    count<T extends UsageLogCountArgs>(args?: Prisma.Subset<T, UsageLogCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], UsageLogCountAggregateOutputType> : number>;
    /**
     * Allows you to perform aggregations operations on a UsageLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageLogAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UsageLogAggregateArgs>(args: Prisma.Subset<T, UsageLogAggregateArgs>): Prisma.PrismaPromise<GetUsageLogAggregateType<T>>;
    /**
     * Group by UsageLog.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UsageLogGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     *
    **/
    groupBy<T extends UsageLogGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: UsageLogGroupByArgs['orderBy'];
    } : {
        orderBy?: UsageLogGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, UsageLogGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUsageLogGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    /**
     * Fields of the UsageLog model
     */
    readonly fields: UsageLogFieldRefs;
}
/**
 * The delegate class that acts as a "Promise-like" for UsageLog.
 * Why is this prefixed with `Prisma__`?
 * Because we want to prevent naming conflicts as mentioned in
 * https://github.com/prisma/prisma-client-js/issues/707
 */
export interface Prisma__UsageLogClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
/**
 * Fields of the UsageLog model
 */
export interface UsageLogFieldRefs {
    readonly id: Prisma.FieldRef<"UsageLog", 'String'>;
    readonly createdAt: Prisma.FieldRef<"UsageLog", 'DateTime'>;
    readonly source: Prisma.FieldRef<"UsageLog", 'String'>;
    readonly model: Prisma.FieldRef<"UsageLog", 'String'>;
    readonly provider: Prisma.FieldRef<"UsageLog", 'String'>;
    readonly promptTokens: Prisma.FieldRef<"UsageLog", 'Int'>;
    readonly completionTokens: Prisma.FieldRef<"UsageLog", 'Int'>;
    readonly totalTokens: Prisma.FieldRef<"UsageLog", 'Int'>;
    readonly latency: Prisma.FieldRef<"UsageLog", 'Int'>;
    readonly success: Prisma.FieldRef<"UsageLog", 'Boolean'>;
    readonly error: Prisma.FieldRef<"UsageLog", 'String'>;
    readonly callerIp: Prisma.FieldRef<"UsageLog", 'String'>;
}
/**
 * UsageLog findUnique
 */
export type UsageLogFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: Prisma.UsageLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UsageLog
     */
    omit?: Prisma.UsageLogOmit<ExtArgs> | null;
    /**
     * Filter, which UsageLog to fetch.
     */
    where: Prisma.UsageLogWhereUniqueInput;
};
/**
 * UsageLog findUniqueOrThrow
 */
export type UsageLogFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: Prisma.UsageLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UsageLog
     */
    omit?: Prisma.UsageLogOmit<ExtArgs> | null;
    /**
     * Filter, which UsageLog to fetch.
     */
    where: Prisma.UsageLogWhereUniqueInput;
};
/**
 * UsageLog findFirst
 */
export type UsageLogFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: Prisma.UsageLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UsageLog
     */
    omit?: Prisma.UsageLogOmit<ExtArgs> | null;
    /**
     * Filter, which UsageLog to fetch.
     */
    where?: Prisma.UsageLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UsageLogs to fetch.
     */
    orderBy?: Prisma.UsageLogOrderByWithRelationInput | Prisma.UsageLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for UsageLogs.
     */
    cursor?: Prisma.UsageLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UsageLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UsageLogs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of UsageLogs.
     */
    distinct?: Prisma.UsageLogScalarFieldEnum | Prisma.UsageLogScalarFieldEnum[];
};
/**
 * UsageLog findFirstOrThrow
 */
export type UsageLogFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: Prisma.UsageLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UsageLog
     */
    omit?: Prisma.UsageLogOmit<ExtArgs> | null;
    /**
     * Filter, which UsageLog to fetch.
     */
    where?: Prisma.UsageLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UsageLogs to fetch.
     */
    orderBy?: Prisma.UsageLogOrderByWithRelationInput | Prisma.UsageLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for searching for UsageLogs.
     */
    cursor?: Prisma.UsageLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UsageLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UsageLogs.
     */
    skip?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     *
     * Filter by unique combinations of UsageLogs.
     */
    distinct?: Prisma.UsageLogScalarFieldEnum | Prisma.UsageLogScalarFieldEnum[];
};
/**
 * UsageLog findMany
 */
export type UsageLogFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: Prisma.UsageLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UsageLog
     */
    omit?: Prisma.UsageLogOmit<ExtArgs> | null;
    /**
     * Filter, which UsageLogs to fetch.
     */
    where?: Prisma.UsageLogWhereInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     *
     * Determine the order of UsageLogs to fetch.
     */
    orderBy?: Prisma.UsageLogOrderByWithRelationInput | Prisma.UsageLogOrderByWithRelationInput[];
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     *
     * Sets the position for listing UsageLogs.
     */
    cursor?: Prisma.UsageLogWhereUniqueInput;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Take `±n` UsageLogs from the position of the cursor.
     */
    take?: number;
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     *
     * Skip the first `n` UsageLogs.
     */
    skip?: number;
    distinct?: Prisma.UsageLogScalarFieldEnum | Prisma.UsageLogScalarFieldEnum[];
};
/**
 * UsageLog create
 */
export type UsageLogCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: Prisma.UsageLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UsageLog
     */
    omit?: Prisma.UsageLogOmit<ExtArgs> | null;
    /**
     * The data needed to create a UsageLog.
     */
    data: Prisma.XOR<Prisma.UsageLogCreateInput, Prisma.UsageLogUncheckedCreateInput>;
};
/**
 * UsageLog createMany
 */
export type UsageLogCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to create many UsageLogs.
     */
    data: Prisma.UsageLogCreateManyInput | Prisma.UsageLogCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * UsageLog createManyAndReturn
 */
export type UsageLogCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: Prisma.UsageLogSelectCreateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the UsageLog
     */
    omit?: Prisma.UsageLogOmit<ExtArgs> | null;
    /**
     * The data used to create many UsageLogs.
     */
    data: Prisma.UsageLogCreateManyInput | Prisma.UsageLogCreateManyInput[];
    skipDuplicates?: boolean;
};
/**
 * UsageLog update
 */
export type UsageLogUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: Prisma.UsageLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UsageLog
     */
    omit?: Prisma.UsageLogOmit<ExtArgs> | null;
    /**
     * The data needed to update a UsageLog.
     */
    data: Prisma.XOR<Prisma.UsageLogUpdateInput, Prisma.UsageLogUncheckedUpdateInput>;
    /**
     * Choose, which UsageLog to update.
     */
    where: Prisma.UsageLogWhereUniqueInput;
};
/**
 * UsageLog updateMany
 */
export type UsageLogUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * The data used to update UsageLogs.
     */
    data: Prisma.XOR<Prisma.UsageLogUpdateManyMutationInput, Prisma.UsageLogUncheckedUpdateManyInput>;
    /**
     * Filter which UsageLogs to update
     */
    where?: Prisma.UsageLogWhereInput;
    /**
     * Limit how many UsageLogs to update.
     */
    limit?: number;
};
/**
 * UsageLog updateManyAndReturn
 */
export type UsageLogUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: Prisma.UsageLogSelectUpdateManyAndReturn<ExtArgs> | null;
    /**
     * Omit specific fields from the UsageLog
     */
    omit?: Prisma.UsageLogOmit<ExtArgs> | null;
    /**
     * The data used to update UsageLogs.
     */
    data: Prisma.XOR<Prisma.UsageLogUpdateManyMutationInput, Prisma.UsageLogUncheckedUpdateManyInput>;
    /**
     * Filter which UsageLogs to update
     */
    where?: Prisma.UsageLogWhereInput;
    /**
     * Limit how many UsageLogs to update.
     */
    limit?: number;
};
/**
 * UsageLog upsert
 */
export type UsageLogUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: Prisma.UsageLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UsageLog
     */
    omit?: Prisma.UsageLogOmit<ExtArgs> | null;
    /**
     * The filter to search for the UsageLog to update in case it exists.
     */
    where: Prisma.UsageLogWhereUniqueInput;
    /**
     * In case the UsageLog found by the `where` argument doesn't exist, create a new UsageLog with this data.
     */
    create: Prisma.XOR<Prisma.UsageLogCreateInput, Prisma.UsageLogUncheckedCreateInput>;
    /**
     * In case the UsageLog was found with the provided `where` argument, update it with this data.
     */
    update: Prisma.XOR<Prisma.UsageLogUpdateInput, Prisma.UsageLogUncheckedUpdateInput>;
};
/**
 * UsageLog delete
 */
export type UsageLogDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: Prisma.UsageLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UsageLog
     */
    omit?: Prisma.UsageLogOmit<ExtArgs> | null;
    /**
     * Filter which UsageLog to delete.
     */
    where: Prisma.UsageLogWhereUniqueInput;
};
/**
 * UsageLog deleteMany
 */
export type UsageLogDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Filter which UsageLogs to delete
     */
    where?: Prisma.UsageLogWhereInput;
    /**
     * Limit how many UsageLogs to delete.
     */
    limit?: number;
};
/**
 * UsageLog without action
 */
export type UsageLogDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UsageLog
     */
    select?: Prisma.UsageLogSelect<ExtArgs> | null;
    /**
     * Omit specific fields from the UsageLog
     */
    omit?: Prisma.UsageLogOmit<ExtArgs> | null;
};
export {};
