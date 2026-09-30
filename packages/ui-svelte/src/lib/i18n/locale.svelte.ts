export type UiLanguage = "en" | "zh";

const en = {
	"file.added": "Added",
	"file.modified": "Modified",
	"file.deleted": "Deleted",
	"file.renamed": "Renamed",
	"review.closed": "Closed",
	"review.processing": "Processing",
	"review.changesRequested": "Changes requested",
	"review.approved": "Approved",
	"review.inDiscussion": "In discussion",
	"review.unreviewed": "Unreviewed",
	"pr.loading": "Loading...",
	"pr.merged": "Merged",
	"pr.closed": "Closed",
	"pr.draft": "Draft",
	"pr.open": "Open",
	"time.justNow": "just now",
	"image.before": "Before",
	"image.after": "After",
	"image.removed": "Removed",
	"image.added": "Added",
	"image.twoUp": "2-up",
	"image.swipe": "Swipe",
	"image.onion": "Onion Skin",
} as const;

const zh: Record<keyof typeof en, string> = {
	"file.added": "已添加",
	"file.modified": "已修改",
	"file.deleted": "已删除",
	"file.renamed": "已重命名",
	"review.closed": "已关闭",
	"review.processing": "处理中",
	"review.changesRequested": "请求修改",
	"review.approved": "已通过",
	"review.inDiscussion": "讨论中",
	"review.unreviewed": "未评审",
	"pr.loading": "加载中…",
	"pr.merged": "已合并",
	"pr.closed": "已关闭",
	"pr.draft": "草稿",
	"pr.open": "打开",
	"time.justNow": "刚刚",
	"image.before": "之前",
	"image.after": "之后",
	"image.removed": "已删除",
	"image.added": "已添加",
	"image.twoUp": "并排",
	"image.swipe": "滑动",
	"image.onion": "叠化",
};

export type UiMessageKey = keyof typeof en;

let language = $state<UiLanguage>("en");

export function getUiLanguage(): UiLanguage {
	return language;
}

export function setUiLanguage(next: UiLanguage) {
	language = next;
}

export function uiText(key: UiMessageKey): string {
	return language === "zh" ? zh[key] : en[key];
}
