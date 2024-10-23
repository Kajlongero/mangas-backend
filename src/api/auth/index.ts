import passport from "passport";
import { JwtBearer, JwtBody } from "./strategies/jwt.strategy";
import { LocalStrategy } from "./strategies/local.strategy";

passport.use("jwt-body", JwtBody);
passport.use("jwt-bearer", JwtBearer);
passport.use("local", LocalStrategy);
