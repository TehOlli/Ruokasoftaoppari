app.service('image', function(address){
    var time = Date.now();
    var address = address.getAddress();

    this.getImage = function(eleId, id, location){
        var time = Date.now();
        document.getElementById(eleId).style.background = "url(" + address + "uploads/" + location + id + ".jpg" + "?" + time + ")";
        document.getElementById(eleId).style.backgroundSize = "cover";
    }

    this.tempImage = function(eleId, files, name){
        var form = new FormData();
        form.append(name, files[0]);

        var reader = new FileReader();
        reader.readAsDataURL(files[0]);

        reader.onload = function (e){
            document.getElementById(eleId).style.background = "url(" + e.target.result + ")";
            document.getElementById(eleId).style.backgroundSize = "cover";
        }
        return form;

    }
});