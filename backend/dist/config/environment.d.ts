interface EnvironmentConfig {
    port: number;
    nodeEnv: string;
    mongodbUri: string;
    mongodbTestUri: string;
    jwtSecret: string;
    jwtExpiresIn: string;
    googleApiKey: string;
    frontendUrl: string;
    rateLimitWindowMs: number;
    rateLimitMaxRequests: number;
    logLevel: string;
    aiTemperature: number;
    aiMaxOutputTokens: number;
    xpPerLevel: number;
    maxLevel: number;
}
declare const config: EnvironmentConfig;
export default config;
//# sourceMappingURL=environment.d.ts.map