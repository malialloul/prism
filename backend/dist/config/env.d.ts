import type { Secret, SignOptions } from 'jsonwebtoken';
export declare const config: {
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
    };
    server: {
        port: number;
        nodeEnv: string;
    };
};
//# sourceMappingURL=env.d.ts.map