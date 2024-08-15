export const OLD_URL = 'https://api-takumi.mihoyo.com',
  NEW_URL = 'https://api-takumi-record.mihoyo.com';

export const ZZZ_API = `${NEW_URL}/event/game_record_zzz/api/zzz`,
  ZZZ_INDEX_API = `${ZZZ_API}/index`,
  ZZZ_NOTE_API = `${ZZZ_API}/note`,
  ZZZ_BUDDY_INFO_API = `${ZZZ_API}/buddy/info`,
  ZZZ_AVATAR_BASIC_API = `${ZZZ_API}/avatar/basic`,
  ZZZ_AVATAR_INFO_API = `${ZZZ_API}/avatar/info`,
  ZZZ_CHALLENGE_API = `${ZZZ_API}/challenge`,
  ZZZ_BIND_API = `${OLD_URL}/binding/api`,
  ZZZ_GAME_INFO_API = `${ZZZ_BIND_API}/getUserGameRolesByCookie?game_biz=nap_cn`;

// Resource
export const ZZZ_RES = 'https://act-webstatic.mihoyo.com/game_record/zzz',
  ZZZ_SQUARE_AVATAR = `${ZZZ_RES}/role_square_avatar`,
  ZZZ_SQUARE_BANGBOO = `${ZZZ_RES}/bangboo_rectangle_avatar`;
export const NEW_ZZZ_RES = 'https://act-webstatic.mihoyo.com/game_record/nap',
  NEW_ZZZ_SQUARE_AVATAR = `${NEW_ZZZ_RES}/role_square_avatar`,
  NEW_ZZZ_SQUARE_BANGBOO = `${NEW_ZZZ_RES}/bangboo_rectangle_avatar`;

export const PUBLIC_API = 'https://public-operation-nap.mihoyo.com',
  PUBILC_GACHA_LOG_API = `${PUBLIC_API}/common/gacha_record/api`,
  ZZZ_GET_GACHA_LOG_API = `${PUBILC_GACHA_LOG_API}/getGachaLog`;
