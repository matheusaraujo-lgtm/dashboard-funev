import { handleUpload } from "@vercel/blob/client";
import { autenticarRequisicao, exigirAdmin } from "@/lib/auth";
import { withApiRateLimit, jsonErro, jsonOk } from "@/lib/api-helpers";

export async function POST(request) {
  return withApiRateLimit(request, async () => {
    const auth = await autenticarRequisicao(request);
    if (auth.erro) return jsonErro(auth.erro, auth.status);

    const admin = exigirAdmin(auth.usuario);
    if (admin) return jsonErro(admin.erro, admin.status);

    try {
      const body = await request.json();

      const resposta = await handleUpload({
        body,
        request,
        onBeforeGenerateToken: async () => ({
          allowedContentTypes: ["text/html"],
          maximumSizeInBytes: 20 * 1024 * 1024,
          tokenPayload: JSON.stringify({ adminId: auth.usuario.id }),
        }),
        onUploadCompleted: async () => {},
      });

      return jsonOk(resposta);
    } catch (err) {
      return jsonErro(err.message || "Erro ao gerar URL de upload.", 400);
    }
  });
}
