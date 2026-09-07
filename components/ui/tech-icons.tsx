import type { ComponentType, SVGProps } from "react";

import SiPython from "@icons-pack/react-simple-icons/icons/SiPython";
import SiTypescript from "@icons-pack/react-simple-icons/icons/SiTypescript";
import SiJavascript from "@icons-pack/react-simple-icons/icons/SiJavascript";
import SiCplusplus from "@icons-pack/react-simple-icons/icons/SiCplusplus";
import SiOpenjdk from "@icons-pack/react-simple-icons/icons/SiOpenjdk";
import SiGnubash from "@icons-pack/react-simple-icons/icons/SiGnubash";
import SiHtml5 from "@icons-pack/react-simple-icons/icons/SiHtml5";
import SiCss from "@icons-pack/react-simple-icons/icons/SiCss";
import SiModelcontextprotocol from "@icons-pack/react-simple-icons/icons/SiModelcontextprotocol";
import SiLangchain from "@icons-pack/react-simple-icons/icons/SiLangchain";
import SiLanggraph from "@icons-pack/react-simple-icons/icons/SiLanggraph";
import SiHuggingface from "@icons-pack/react-simple-icons/icons/SiHuggingface";
import SiVllm from "@icons-pack/react-simple-icons/icons/SiVllm";
import SiModal from "@icons-pack/react-simple-icons/icons/SiModal";
import SiMeta from "@icons-pack/react-simple-icons/icons/SiMeta";
import SiPydantic from "@icons-pack/react-simple-icons/icons/SiPydantic";
import SiPostgresql from "@icons-pack/react-simple-icons/icons/SiPostgresql";
import SiPytorch from "@icons-pack/react-simple-icons/icons/SiPytorch";
import SiTensorflow from "@icons-pack/react-simple-icons/icons/SiTensorflow";
import SiScikitlearn from "@icons-pack/react-simple-icons/icons/SiScikitlearn";
import SiNumpy from "@icons-pack/react-simple-icons/icons/SiNumpy";
import SiPandas from "@icons-pack/react-simple-icons/icons/SiPandas";
import SiOpencv from "@icons-pack/react-simple-icons/icons/SiOpencv";
import SiNvidia from "@icons-pack/react-simple-icons/icons/SiNvidia";
import SiFastapi from "@icons-pack/react-simple-icons/icons/SiFastapi";
import SiDjango from "@icons-pack/react-simple-icons/icons/SiDjango";
import SiFlask from "@icons-pack/react-simple-icons/icons/SiFlask";
import SiNodedotjs from "@icons-pack/react-simple-icons/icons/SiNodedotjs";
import SiExpress from "@icons-pack/react-simple-icons/icons/SiExpress";
import SiSpringboot from "@icons-pack/react-simple-icons/icons/SiSpringboot";
import SiSocketdotio from "@icons-pack/react-simple-icons/icons/SiSocketdotio";
import SiCelery from "@icons-pack/react-simple-icons/icons/SiCelery";
import SiRedis from "@icons-pack/react-simple-icons/icons/SiRedis";
import SiApachekafka from "@icons-pack/react-simple-icons/icons/SiApachekafka";
import SiSwagger from "@icons-pack/react-simple-icons/icons/SiSwagger";
import SiOpenapiinitiative from "@icons-pack/react-simple-icons/icons/SiOpenapiinitiative";
import SiSqlalchemy from "@icons-pack/react-simple-icons/icons/SiSqlalchemy";
import SiPrisma from "@icons-pack/react-simple-icons/icons/SiPrisma";
import SiPytest from "@icons-pack/react-simple-icons/icons/SiPytest";
import SiOpenid from "@icons-pack/react-simple-icons/icons/SiOpenid";
import SiJsonwebtokens from "@icons-pack/react-simple-icons/icons/SiJsonwebtokens";
import SiMysql from "@icons-pack/react-simple-icons/icons/SiMysql";
import SiMongodb from "@icons-pack/react-simple-icons/icons/SiMongodb";
import SiUpstash from "@icons-pack/react-simple-icons/icons/SiUpstash";
import SiSupabase from "@icons-pack/react-simple-icons/icons/SiSupabase";
import SiMinio from "@icons-pack/react-simple-icons/icons/SiMinio";
import SiGooglecloud from "@icons-pack/react-simple-icons/icons/SiGooglecloud";
import SiDocker from "@icons-pack/react-simple-icons/icons/SiDocker";
import SiKubernetes from "@icons-pack/react-simple-icons/icons/SiKubernetes";
import SiTerraform from "@icons-pack/react-simple-icons/icons/SiTerraform";
import SiGithubactions from "@icons-pack/react-simple-icons/icons/SiGithubactions";
import SiRailway from "@icons-pack/react-simple-icons/icons/SiRailway";
import SiGit from "@icons-pack/react-simple-icons/icons/SiGit";
import SiApachemaven from "@icons-pack/react-simple-icons/icons/SiApachemaven";
import SiWeightsandbiases from "@icons-pack/react-simple-icons/icons/SiWeightsandbiases";
import SiMlflow from "@icons-pack/react-simple-icons/icons/SiMlflow";
import SiK6 from "@icons-pack/react-simple-icons/icons/SiK6";
import SiNextdotjs from "@icons-pack/react-simple-icons/icons/SiNextdotjs";
import SiReact from "@icons-pack/react-simple-icons/icons/SiReact";
import SiTailwindcss from "@icons-pack/react-simple-icons/icons/SiTailwindcss";
import SiGradio from "@icons-pack/react-simple-icons/icons/SiGradio";

type IconProps = SVGProps<SVGSVGElement>;

/**
 * Brand marks for the skills field.
 *
 * Icons are deep-imported one file at a time rather than pulled from the
 * package root the way `social-icons.tsx` does it. That file needs two icons,
 * so the barrel is fine there; routing sixty through a 3,400-export barrel
 * slows the dev compile noticeably even though production tree-shakes it away.
 *
 * `color` is the hex the glyph renders in. It is normally the brand's official
 * colour, but any brand whose official colour is near-black — Express, Next.js,
 * Socket.IO, Prisma, Kafka, Railway, OpenJDK, JWT, MCP — is overridden to white,
 * because on this page black is invisible. Same call the GitHub mark already
 * gets in `social-icons.tsx`. NumPy, pandas and Django are overridden to their
 * lighter secondary brand colours for the same reason.
 *
 * The resting state greys these out in CSS (`.skill-node-glyph`); the colour
 * here is what blooms in on hover.
 */

/**
 * Simple Icons drops brands on trademark request, which is why these three
 * aren't imports like everything above — the same reason LinkedIn is drawn by
 * hand in `social-icons.tsx`. All three are the official marks, not
 * approximations: OpenAI and AWS are the paths Simple Icons shipped before
 * removal, Chroma's is its published logo.
 */
const OpenAiIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...props}>
    <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
  </svg>
);

const AwsIcon = (props: IconProps) => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false" {...props}>
    <path d="M6.763 10.036c0 .296.032.535.088.71.064.176.144.368.256.576.04.063.056.127.056.183 0 .08-.048.16-.152.24l-.503.335a.383.383 0 0 1-.208.072c-.08 0-.16-.04-.239-.112a2.47 2.47 0 0 1-.287-.375 6.18 6.18 0 0 1-.248-.471c-.622.734-1.405 1.101-2.347 1.101-.67 0-1.205-.191-1.596-.574-.391-.384-.59-.894-.59-1.533 0-.678.239-1.23.726-1.644.487-.415 1.133-.623 1.955-.623.272 0 .551.024.846.064.296.04.6.104.918.176v-.583c0-.607-.127-1.03-.375-1.277-.255-.248-.686-.367-1.3-.367-.28 0-.568.031-.863.103-.295.072-.583.16-.862.272a2.287 2.287 0 0 1-.28.104.488.488 0 0 1-.127.023c-.112 0-.168-.08-.168-.247v-.391c0-.128.016-.224.056-.28a.597.597 0 0 1 .224-.167c.279-.144.614-.264 1.005-.36a4.84 4.84 0 0 1 1.246-.151c.95 0 1.644.216 2.091.647.439.43.662 1.085.662 1.963v2.586zm-3.24 1.214c.263 0 .534-.048.822-.144.287-.096.543-.271.758-.51.128-.152.224-.32.272-.512.047-.191.08-.423.08-.694v-.335a6.66 6.66 0 0 0-.735-.136 6.02 6.02 0 0 0-.75-.048c-.535 0-.926.104-1.19.32-.263.215-.39.518-.39.917 0 .375.095.655.295.846.191.2.47.296.838.296zm6.41.862c-.144 0-.24-.024-.304-.08-.064-.048-.12-.16-.168-.311L7.586 5.55a1.398 1.398 0 0 1-.072-.32c0-.128.064-.2.191-.2h.783c.151 0 .255.025.31.08.065.048.113.16.16.312l1.342 5.284 1.245-5.284c.04-.16.088-.264.151-.312a.549.549 0 0 1 .32-.08h.638c.152 0 .256.025.32.08.063.048.12.16.151.312l1.261 5.348 1.381-5.348c.048-.16.104-.264.16-.312a.52.52 0 0 1 .311-.08h.743c.127 0 .2.065.2.2 0 .04-.009.08-.017.128a1.137 1.137 0 0 1-.056.2l-1.923 6.17c-.048.16-.104.263-.168.311a.51.51 0 0 1-.303.08h-.687c-.151 0-.255-.024-.32-.08-.063-.056-.119-.16-.15-.32l-1.238-5.148-1.23 5.14c-.04.16-.087.264-.15.32-.065.056-.177.08-.32.08zm10.256.215c-.415 0-.83-.048-1.229-.143-.399-.096-.71-.2-.918-.32-.128-.071-.215-.151-.247-.223a.563.563 0 0 1-.048-.224v-.407c0-.167.064-.247.183-.247.048 0 .096.008.144.024.048.016.12.048.2.08.271.12.566.215.878.279.319.064.63.096.95.096.502 0 .894-.088 1.165-.264a.86.86 0 0 0 .415-.758.777.777 0 0 0-.215-.559c-.144-.151-.416-.287-.807-.415l-1.157-.36c-.583-.183-1.014-.454-1.277-.813a1.902 1.902 0 0 1-.4-1.158c0-.335.073-.63.216-.886.144-.255.335-.479.575-.654.24-.184.51-.32.83-.415.32-.096.655-.136 1.006-.136.175 0 .359.008.535.032.183.024.35.056.518.088.16.04.312.08.455.127.144.048.256.096.336.144a.69.69 0 0 1 .24.2.43.43 0 0 1 .071.263v.375c0 .168-.064.256-.184.256a.83.83 0 0 1-.303-.096 3.652 3.652 0 0 0-1.532-.311c-.455 0-.815.071-1.062.223-.248.152-.375.383-.375.71 0 .224.08.416.24.567.159.152.454.304.877.44l1.134.358c.574.184.99.44 1.237.767.247.327.367.702.367 1.117 0 .343-.072.655-.207.926-.144.272-.336.511-.583.703-.248.2-.543.343-.886.447-.36.111-.734.167-1.142.167zM21.698 16.207c-2.626 1.94-6.442 2.969-9.722 2.969-4.598 0-8.74-1.7-11.87-4.526-.247-.223-.024-.527.272-.351 3.384 1.963 7.559 3.153 11.877 3.153 2.914 0 6.114-.607 9.06-1.852.439-.2.814.287.383.607zM22.792 14.961c-.336-.43-2.22-.207-3.074-.103-.255.032-.295-.192-.063-.36 1.5-1.053 3.967-.75 4.254-.399.287.36-.08 2.826-1.485 4.007-.215.184-.423.088-.327-.151.32-.79 1.03-2.57.695-2.994z" />
  </svg>
);

/**
 * Chroma's logo is three interlocking shapes in three colours, so unlike every
 * other mark here it ignores `currentColor` and always paints itself. Its
 * viewBox is wider than tall; it letterboxes inside the square node box.
 */
const ChromaIcon = (props: IconProps) => (
  <svg viewBox="0 0 256 164" aria-hidden focusable="false" {...props}>
    <ellipse fill="#FFDE2D" cx="170.6668" cy="81.9198" rx="85.3332" ry="81.9198" />
    <ellipse fill="#327EFF" cx="85.3332" cy="81.9198" rx="85.3332" ry="81.9198" />
    <path
      fill="#FF6446"
      d="M170.6668 81.92c0 45.2434-38.2054 81.9192-85.3337 81.9192V81.92h85.3337ZM85.3332 81.9198C85.3332 36.6768 123.5382 0 170.6668 0v81.9198H85.3332Z"
    />
  </svg>
);

export interface TechMark {
  Icon: ComponentType<IconProps>;
  /** Revealed on hover; the resting state greys the glyph out. */
  color: string;
}

export const techMarks = {
  python: { Icon: SiPython, color: "#3776AB" },
  typescript: { Icon: SiTypescript, color: "#3178C6" },
  javascript: { Icon: SiJavascript, color: "#F7DF1E" },
  cpp: { Icon: SiCplusplus, color: "#00599C" },
  java: { Icon: SiOpenjdk, color: "#FFFFFF" },
  bash: { Icon: SiGnubash, color: "#4EAA25" },
  html: { Icon: SiHtml5, color: "#E34F26" },
  css: { Icon: SiCss, color: "#663399" },
  mcp: { Icon: SiModelcontextprotocol, color: "#FFFFFF" },
  langchain: { Icon: SiLangchain, color: "#7FC8FF" },
  langgraph: { Icon: SiLanggraph, color: "#7FC8FF" },
  huggingface: { Icon: SiHuggingface, color: "#FFD21E" },
  vllm: { Icon: SiVllm, color: "#30A2FF" },
  modal: { Icon: SiModal, color: "#7FEE64" },
  meta: { Icon: SiMeta, color: "#0467DF" },
  pydantic: { Icon: SiPydantic, color: "#E92063" },
  postgresql: { Icon: SiPostgresql, color: "#4169E1" },
  pytorch: { Icon: SiPytorch, color: "#EE4C2C" },
  tensorflow: { Icon: SiTensorflow, color: "#FF6F00" },
  scikitlearn: { Icon: SiScikitlearn, color: "#F7931E" },
  numpy: { Icon: SiNumpy, color: "#4DABCF" },
  pandas: { Icon: SiPandas, color: "#E70488" },
  opencv: { Icon: SiOpencv, color: "#5C3EE8" },
  cuda: { Icon: SiNvidia, color: "#76B900" },
  fastapi: { Icon: SiFastapi, color: "#009688" },
  django: { Icon: SiDjango, color: "#44B78B" },
  flask: { Icon: SiFlask, color: "#3BABC3" },
  nodejs: { Icon: SiNodedotjs, color: "#5FA04E" },
  express: { Icon: SiExpress, color: "#FFFFFF" },
  springboot: { Icon: SiSpringboot, color: "#6DB33F" },
  socketio: { Icon: SiSocketdotio, color: "#FFFFFF" },
  celery: { Icon: SiCelery, color: "#37814A" },
  redis: { Icon: SiRedis, color: "#FF4438" },
  kafka: { Icon: SiApachekafka, color: "#FFFFFF" },
  swagger: { Icon: SiSwagger, color: "#85EA2D" },
  openapi: { Icon: SiOpenapiinitiative, color: "#6BA539" },
  sqlalchemy: { Icon: SiSqlalchemy, color: "#D71F00" },
  prisma: { Icon: SiPrisma, color: "#FFFFFF" },
  pytest: { Icon: SiPytest, color: "#0A9EDC" },
  openid: { Icon: SiOpenid, color: "#F78C40" },
  jwt: { Icon: SiJsonwebtokens, color: "#FFFFFF" },
  mysql: { Icon: SiMysql, color: "#4479A1" },
  mongodb: { Icon: SiMongodb, color: "#47A248" },
  upstash: { Icon: SiUpstash, color: "#00E9A3" },
  supabase: { Icon: SiSupabase, color: "#3FCF8E" },
  minio: { Icon: SiMinio, color: "#C72E49" },
  googlecloud: { Icon: SiGooglecloud, color: "#4285F4" },
  docker: { Icon: SiDocker, color: "#2496ED" },
  kubernetes: { Icon: SiKubernetes, color: "#326CE5" },
  terraform: { Icon: SiTerraform, color: "#844FBA" },
  githubactions: { Icon: SiGithubactions, color: "#2088FF" },
  railway: { Icon: SiRailway, color: "#FFFFFF" },
  git: { Icon: SiGit, color: "#F03C2E" },
  maven: { Icon: SiApachemaven, color: "#C71A36" },
  wandb: { Icon: SiWeightsandbiases, color: "#FFBE00" },
  mlflow: { Icon: SiMlflow, color: "#0194E2" },
  k6: { Icon: SiK6, color: "#7D64FF" },
  nextjs: { Icon: SiNextdotjs, color: "#FFFFFF" },
  react: { Icon: SiReact, color: "#61DAFB" },
  tailwind: { Icon: SiTailwindcss, color: "#06B6D4" },
  gradio: { Icon: SiGradio, color: "#F97316" },
  openai: { Icon: OpenAiIcon, color: "#FFFFFF" },
  aws: { Icon: AwsIcon, color: "#FF9900" },
  chroma: { Icon: ChromaIcon, color: "#327EFF" },
} satisfies Record<string, TechMark>;

/** Every icon key the skills data is allowed to reference. */
export type TechKey = keyof typeof techMarks;
