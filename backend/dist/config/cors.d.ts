declare const corsOptions: {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => void;
    credentials: boolean;
    methods: string[];
    allowedHeaders: string[];
    exposedHeaders: string[];
    optionsSuccessStatus: number;
    maxAge: number;
};
export default corsOptions;
//# sourceMappingURL=cors.d.ts.map