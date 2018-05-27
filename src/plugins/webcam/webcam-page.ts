
export const WEBCAM_PAGE = `
<!DOCTYPE html>
<html>
    <head>
        <title>UV4L Stream</title>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
        <script>
            function errorFunction() {
                alert('Stream stopped');
            }
        </script>
        <img src="./stream.mpg" alt="image"  >
    </body>
</html>
`;