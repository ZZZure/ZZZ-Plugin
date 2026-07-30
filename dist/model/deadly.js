import request from '../utils/request.js';
export class Deadly {
    start_time;
    end_time;
    nick_name;
    avatar_icon;
    has_data;
    zone_id;
    total_star;
    rank_percent;
    total_score;
    list;
    total_max_score;
    room_max_score;
    has_hard;
    hard_list;
    hard_rank_percent;
    constructor(data) {
        this.start_time = new DeadlyTime(data?.start_time);
        this.end_time = new DeadlyTime(data?.end_time);
        this.nick_name = data?.nick_name || '';
        this.avatar_icon = data?.avatar_icon || '';
        this.has_data = data?.has_data ?? false;
        this.zone_id = data?.zone_id ?? 0;
        this.total_star = data?.total_star ?? 0;
        this.rank_percent = data?.rank_percent ?? 0;
        this.total_score = data?.total_score ?? 0;
        this.list = (data?.list || []).map(item => new DeadlyList(item));
        this.total_max_score = data?.total_max_score ?? 0;
        this.room_max_score = data?.room_max_score ?? 0;
        this.has_hard = data?.has_hard ?? false;
        this.hard_list = (data?.hard_list || []).map(item => new DeadlyList(item));
        this.hard_rank_percent = data?.hard_rank_percent ?? 0;
    }
    get rank_bg() {
        const pct = (this.rank_percent || 0) / 100;
        if (pct < 1)
            return 1;
        if (pct < 5)
            return 2;
        if (pct < 10)
            return 3;
        if (pct < 50)
            return 4;
        return 5;
    }
    get hard_rank_bg() {
        const pct = (this.hard_rank_percent || 0) / 100;
        if (pct < 1)
            return 1;
        if (pct < 5)
            return 2;
        if (pct < 10)
            return 3;
        if (pct < 50)
            return 4;
        return 5;
    }
    async get_assets() {
        if (this.avatar_icon && this.avatar_icon.startsWith('http')) {
            try {
                const response = await request.get(this.avatar_icon);
                const buffer = await response.arrayBuffer();
                this.avatar_icon = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
            }
            catch {
            }
        }
        await Promise.all([
            ...this.list.map(item => item.get_assets()),
            ...this.hard_list.map(item => item.get_assets()),
        ]);
    }
}
export class DeadlyList {
    star;
    score;
    boss;
    buffer;
    buddy;
    total_star;
    challenge_time;
    avatar_list;
    constructor(data) {
        this.star = data?.star ?? 0;
        this.score = data?.score ?? 0;
        this.boss = (data?.boss || []).map(b => new Bos(b));
        this.buffer = (data?.buffer || []).map(b => new DeadBuffer(b));
        this.buddy = (data?.buddy && data.buddy.id) ? new Buddy(data.buddy) : null;
        this.total_star = data?.total_star ?? 0;
        this.challenge_time = new DeadlyTime(data?.challenge_time);
        this.avatar_list = (data?.avatar_list || []).map(item => new AvatarList(item));
    }
    async get_assets() {
        await Promise.all([
            this.buddy?.get_assets(),
            ...this.avatar_list.map(avatar => avatar.get_assets()),
            ...this.boss.map(boss => boss.get_assets()),
            ...this.buffer.map(buffer => buffer.get_assets()),
        ]);
    }
}
export class AvatarList {
    rarity;
    element_type;
    avatar_profession;
    id;
    level;
    rank;
    role_square_url;
    sub_element_type;
    constructor(data) {
        this.rarity = data?.rarity || 'A';
        this.element_type = data?.element_type ?? 0;
        this.avatar_profession = data?.avatar_profession ?? 0;
        this.id = data?.id ?? 0;
        this.level = data?.level ?? 1;
        this.rank = data?.rank ?? 0;
        this.role_square_url = data?.role_square_url || '';
        this.sub_element_type = data?.sub_element_type ?? 0;
    }
    async get_assets() {
        if (this.role_square_url && this.role_square_url.startsWith('http')) {
            try {
                const response = await request.get(this.role_square_url);
                const buffer = await response.arrayBuffer();
                this.role_square_url = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
            }
            catch {
            }
        }
    }
}
export class Buddy {
    id;
    rarity;
    level;
    bangboo_rectangle_url;
    constructor(data) {
        this.id = data?.id ?? 0;
        this.rarity = data?.rarity || 'A';
        this.level = data?.level ?? 1;
        this.bangboo_rectangle_url = data?.bangboo_rectangle_url || '';
    }
    async get_assets() {
        if (this.bangboo_rectangle_url && this.bangboo_rectangle_url.startsWith('http')) {
            try {
                const response = await request.get(this.bangboo_rectangle_url);
                const buffer = await response.arrayBuffer();
                this.bangboo_rectangle_url = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
            }
            catch {
            }
        }
    }
}
export class DeadBuffer {
    desc;
    icon;
    name;
    constructor(data) {
        this.desc = data?.desc || '';
        this.icon = data?.icon || '';
        this.name = data?.name || '';
    }
    async get_assets() {
        if (this.icon && this.icon.startsWith('http')) {
            try {
                const response = await request.get(this.icon);
                const buffer = await response.arrayBuffer();
                this.icon = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
            }
            catch {
            }
        }
    }
}
export class Bos {
    race_icon;
    icon;
    name;
    bg_icon;
    constructor(data) {
        this.race_icon = data?.race_icon || '';
        this.icon = data?.icon || '';
        this.name = data?.name || '';
        this.bg_icon = data?.bg_icon || '';
    }
    async get_assets() {
        const fetchAsset = async (url) => {
            if (!url || !url.startsWith('http'))
                return url;
            try {
                const response = await request.get(url);
                const buffer = await response.arrayBuffer();
                return `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
            }
            catch {
                return url;
            }
        };
        const [race_icon, icon, bg_icon] = await Promise.all([
            fetchAsset(this.race_icon),
            fetchAsset(this.icon),
            fetchAsset(this.bg_icon),
        ]);
        this.race_icon = race_icon;
        this.icon = icon;
        this.bg_icon = bg_icon;
    }
}
export class DeadlyTime {
    hour;
    minute;
    second;
    year;
    month;
    day;
    constructor(data) {
        this.hour = data?.hour ?? 0;
        this.minute = data?.minute ?? 0;
        this.second = data?.second ?? 0;
        this.year = data?.year ?? 0;
        this.month = data?.month ?? 0;
        this.day = data?.day ?? 0;
    }
}
//# sourceMappingURL=deadly.js.map