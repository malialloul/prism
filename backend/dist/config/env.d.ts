import type { Secret, SignOptions } from 'jsonwebtoken';
export declare const config: {
    env: {
        nodeEnv: string;
        isProduction: boolean;
        isDevelopment: boolean;
    };
    jwt: {
        secret: Secret;
        expiresIn: SignOptions["expiresIn"];
    };
    postgres: {
        host: string;
        port: number;
        user: string;
        password: string;
        database: string;
        ssl: boolean;
    };
    mysql: {
        host: string;
        port: number;
        user: string;
        password: string;
    };
    server: {
        port: number;
        nodeEnv: string;
    };
    transmissionKey: string;
    neon: {
        apiKey: string;
        orgId: string;
    };
    features: {
        enableHostedDatabases: boolean;
        enableMySQLHosted: boolean;
    };
};
//# sourceMappingURL=env.d.ts.map