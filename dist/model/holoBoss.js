import request from '../utils/request.js';
export class HoloBoss {
    start_time;
    end_time;
    list;
    unlock;
    refresh_time;
    total_star;
    total_time_seconds;
    total_time_str;
    no_injured_count;
    nick_name;
    avatar_icon;
    constructor(data, playerCard) {
        this.start_time = new HoloBossTime(data?.start_time);
        this.end_time = new HoloBossTime(data?.end_time);
        this.unlock = data?.unlock ?? false;
        this.refresh_time = data?.refresh_time ?? 0;
        this.list = (data?.list || []).map(item => new HoloBossListItem(item));
        this.nick_name = playerCard?.player?.nickname || '';
        this.avatar_icon = playerCard?.avatar || '';
        this.total_star = this.list.reduce((sum, item) => sum + (item.star || 0), 0);
        this.total_time_seconds = this.list.reduce((sum, item) => sum + (item.challenge_time_seconds || 0), 0);
        this.no_injured_count = this.list.reduce((sum, item) => sum + (item.boss?.medal?.is_no_injured ? 1 : 0), 0);
        const minutes = Math.floor(this.total_time_seconds / 60);
        const seconds = this.total_time_seconds % 60;
        this.total_time_str = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
    async get_assets() {
        if (this.avatar_icon && this.avatar_icon.startsWith('http')) {
            const avatar_b64 = await request
                .get(this.avatar_icon)
                .then(response => response.arrayBuffer())
                .then(buffer => `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`)
                .catch(() => this.avatar_icon);
            this.avatar_icon = avatar_b64 || this.avatar_icon;
        }
        await Promise.all(this.list.map(item => item.get_assets()));
    }
}
export class HoloBossListItem {
    rank;
    rank_str;
    rank_bg;
    star;
    challenge_time;
    challenge_time_seconds;
    challenge_time_str;
    boss;
    avatar_list;
    constructor(data) {
        this.rank = data?.rank ?? 0;
        if (typeof data?.rank === 'number' && data.rank > 0) {
            const pct = data.rank > 100 ? data.rank / 100 : data.rank;
            this.rank_str = `${pct.toFixed(2)}%`;
            if (pct < 1) {
                this.rank_bg = 1;
            }
            else if (pct < 5) {
                this.rank_bg = 2;
            }
            else if (pct < 10) {
                this.rank_bg = 3;
            }
            else if (pct < 50) {
                this.rank_bg = 4;
            }
            else {
                this.rank_bg = 5;
            }
        }
        else {
            this.rank_str = '';
            this.rank_bg = 5;
        }
        this.star = data?.star ?? 0;
        this.challenge_time = data?.challenge_time ? new HoloBossTime(data.challenge_time) : null;
        const minute = data?.challenge_time?.minute ?? 0;
        const second = data?.challenge_time?.second ?? 0;
        this.challenge_time_seconds = minute * 60 + second;
        const mm = String(minute).padStart(2, '0');
        const ss = String(second).padStart(2, '0');
        this.challenge_time_str = `${mm}:${ss}`;
        this.boss = new HoloBossDetailBoss(data?.boss);
        this.avatar_list = (data?.avatar_list || []).map((item) => new HoloBossAvatar(item));
    }
    async get_assets() {
        await Promise.all([
            this.boss.get_assets(),
            ...this.avatar_list.map(avatar => avatar.get_assets())
        ]);
    }
}
export class HoloBossDetailBoss {
    icon;
    name;
    medal;
    constructor(data) {
        this.icon = data?.icon || '';
        this.name = data?.name || '';
        if (data?.medal) {
            this.medal = new HoloBossMedal(data.medal);
        }
    }
    async get_assets() {
        let icon_b64 = '';
        if (this.icon && this.icon.startsWith('http')) {
            icon_b64 = await request
                .get(this.icon)
                .then(response => response.arrayBuffer())
                .then(buffer => `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`)
                .catch(() => this.icon);
            this.icon = icon_b64 || this.icon;
        }
        if (this.medal) {
            await this.medal.get_assets();
        }
    }
}
export class HoloBossMedal {
    medal_icon;
    medal_id;
    is_no_injured;
    constructor(data) {
        this.medal_icon = data?.medal_icon || '';
        this.medal_id = data?.medal_id ?? 0;
        this.is_no_injured = data?.is_no_injured ?? false;
    }
    async get_assets() {
        if (this.medal_icon && this.medal_icon.startsWith('http')) {
            const medal_b64 = await request
                .get(this.medal_icon)
                .then(response => response.arrayBuffer())
                .then(buffer => `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`)
                .catch(() => this.medal_icon);
            this.medal_icon = medal_b64 || this.medal_icon;
        }
    }
}
export class HoloBossAvatar {
    rarity;
    element_type;
    avatar_profession;
    id;
    level;
    rank;
    role_square_url;
    sub_element_type;
    constructor(data) {
        this.rarity = data?.rarity || 'S';
        this.element_type = data?.element_type ?? 0;
        this.avatar_profession = data?.avatar_profession ?? 0;
        this.id = data?.id ?? 0;
        this.level = data?.level ?? 0;
        this.rank = data?.rank ?? 0;
        this.role_square_url = data?.role_square_url || '';
        this.sub_element_type = data?.sub_element_type ?? 0;
    }
    async get_assets() {
        if (this.role_square_url && this.role_square_url.startsWith('http')) {
            const role_square_b64 = await request
                .get(this.role_square_url)
                .then(response => response.arrayBuffer())
                .then(buffer => `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`)
                .catch(() => this.role_square_url);
            this.role_square_url = role_square_b64 || this.role_square_url;
        }
    }
}
export class HoloBossTime {
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
//# sourceMappingURL=holoBoss.js.map