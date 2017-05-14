app.service('file', function(){
    var chatfile = "";
    this.getFile = function(id){
        document.addEventListener("deviceready", onDeviceReady, false);
        function onDeviceReady() {
            window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, function (fs) {
                console.log('file system open: ' + fs.name);
                fs.root.getFile(id + ".txt", { create: true, exclusive: false }, function (fileEntry) {

                    console.log("fileEntry is file?" + fileEntry.isFile.toString());

                    chatfile = fileEntry;

                }, onErrorCreateFile);

            }, onErrorLoadFs);
            
            function onErrorCreateFile(){
                console.log("onErrorCreateFile");
            }
            function onErrorLoadFs(){
                console.log("onErrorLoadFs");
            }
        }
    }
    this.writetoFile = function(data){
        document.addEventListener("deviceready", onDeviceReady, false);
        function onDeviceReady() {
            chatfile.createWriter(function (fileWriter) {

                fileWriter.onwriteend = function() {
                    console.log("Successful file write...");
                };

                fileWriter.onerror = function (e) {
                    console.log("Failed file write: " + e.toString());
                };

                fileWriter.seek(fileWriter.length);
                fileWriter.write(data);
            });
        }
    }
    this.readFile = function(){
        document.addEventListener("deviceready", onDeviceReady, false);
        function onDeviceReady() {
            chatfile.file(function (file) {
                var reader = new FileReader();

                reader.onloadend = function() {
                    console.log("Successful file read: " + this.result);
                };

                reader.readAsText(file);

            }, onErrorReadFile);

            function onErrorReadFile(){
                console.log("onErrorReadFile");
            }
        }
    }
});