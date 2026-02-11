import { useEffect, useRef } from "react";
import { type AlbumContent } from "~/services/api";
import { useApi } from "~/hooks/useApi";

interface UseContentPollingOptions {
    /** アルバムID */
    albumId: string | undefined;
    /** 現在のコンテンツリスト */
    contents: AlbumContent[];
    /** ポーリング結果の更新コールバック */
    onUpdate: (contents: AlbumContent[], nextCursor: string | null, hasMore: boolean) => void;
    /** ポーリング間隔（ミリ秒、デフォルト: 3000） */
    interval?: number;
}

/**
 * コンテンツ一覧のポーリング機能を提供するカスタムフック
 * 
 * `contents` 内に `pending` または `processing` のステータスを持つコンテンツが存在する場合、
 * 定期的に一覧APIをポーリングしてコンテンツの状態を更新する。
 * 全コンテンツが `completed` または `failed` になるとポーリングを自動停止する。
 */
export function useContentPolling({
    albumId,
    contents,
    onUpdate,
    interval = 3000,
}: UseContentPollingOptions) {
    const api = useApi();
    const intervalIdRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // albumIdが未定義の場合は何もしない
        if (!albumId) {
            return;
        }

        // コンテンツが存在しない場合は何もしない
        if (contents.length === 0) {
            return;
        }

        // 処理中のコンテンツが存在するかチェック
        const hasProcessingContent = contents.some(
            (content) => content.status === "pending" || content.status === "processing"
        );

        // 処理中のコンテンツがない場合は既存のポーリングを停止
        if (!hasProcessingContent) {
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
            return;
        }

        // 既にポーリングが実行中の場合は重複起動を防ぐ
        if (intervalIdRef.current) {
            return;
        }

        // ポーリング関数
        const poll = async () => {
            try {
                // 現在読み込み済みの範囲（contents.length）のみ再取得
                const result = await api.getAlbumContents(albumId, {
                    limit: contents.length,
                });

                // 結果を親コンポーネントに通知
                onUpdate(result.contents, result.nextCursor, result.hasMore);
            } catch (error) {
                console.error("ポーリング中にエラーが発生しました:", error);
                // エラーが発生してもポーリングは継続する
            }
        };

        // ポーリング開始
        intervalIdRef.current = setInterval(poll, interval);

        // クリーンアップ: コンポーネントのアンマウント時またはdependenciesの変更時
        return () => {
            if (intervalIdRef.current) {
                clearInterval(intervalIdRef.current);
                intervalIdRef.current = null;
            }
        };
    }, [albumId, contents, onUpdate, interval, api]);
}
