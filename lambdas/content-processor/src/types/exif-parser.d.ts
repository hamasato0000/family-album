declare module "exif-parser" {
    interface ExifParserResult {
        tags: Record<string, unknown> | null;
        imageSize: { width: number; height: number } | null;
        thumbnailOffset: number | null;
        thumbnailLength: number | null;
        thumbnailType: number | null;
        app1Offset: number | null;
    }

    interface ExifParser {
        parse(): ExifParserResult;
    }

    function create(buffer: Buffer): ExifParser;

    export = { create };
}
