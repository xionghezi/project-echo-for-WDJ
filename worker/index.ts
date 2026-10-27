import handler from "vinext/server/fetch-handler";
import { isSurveyOwner } from "../lib/admin";
import { guardRequest } from "../lib/request-guard";

export default {
  fetch(request: Request, env: Cloudflare.Env, ctx: ExecutionContext) {
    return guardRequest(request, env, isSurveyOwner, (safeRequest) =>
      handler.fetch(safeRequest, env, ctx));
  },
};
