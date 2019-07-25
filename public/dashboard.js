
var ID = function () {
    return Math.random().toString(36).substr(2, 9)+Math.random().toString(36).substr(2, 9);
  };

function textAreaAdjust(o) {
    o.style.height = "1px";
    o.style.height = (25+o.scrollHeight)+"px";
}

function blurred(area){
    if ($(area).val().length < 1 && $(area).attr('id') != 'creator') {
        $.post('/requestdelete', {id: $(area).attr('id')}, (data,status) => {
            console.log(data); console.log(status);
        });
        $(area).parent().remove();
    }
    
}


function optionsBack(link){
    $(link).parent().html('<a onclick="share(this)">share</a> | <a onclick="deleteNote(this)">delete</a> | <a onclick="info(this)">info</a>');
    $(link).parent().css('text-align', 'right');
}

function share(link) {
    console.log($(link).parent().html());
    $(link).parent().html('shareable link:<br> http://nodenotesapp.herokuapp.com/view?note=' 
        + $(link).parent().prev().attr('id') 
        + '<br><a class="shareback" href="#" onclick="optionsBack(this)">go back</a>');
    $('.shareback').css('color', 'grey');
    $(link).parent().css('text-align', 'left');
}

function deleteSure(link) {
    $.post('/requestdelete', {id: $(link).parent().prev().attr('id')}, (data,status) => {
        console.log(data); console.log(status);
    });
    $(link).parent().prev().parent().remove();
}


function deleteNote(link) {
    $(link).parent().html('are you sure? <a href="#" onclick="deleteSure(this)">yes</a> <a href="#" onclick="optionsBack(this)">no</a>');
    $('.options a').css('color', 'grey');
    $(link).parent().css('text-align', 'left');
}

function info(link) {
    $.post('/requestinfo', {id: $(link).parent().prev().attr('id')}, (data,status) => {
        if (status == 'success') {
            $(link).parent().html('created: ' + data.created + '<br>edited: ' 
                + data.edited + '<br><a href="#" onclick="optionsBack(this)">go back</a>');
            $('.options a').css('color', 'grey');
            $(link).parent().css('text-align', 'left');
        }
    });
}

function updateTextArea(textarea){
        textAreaAdjust($(textarea).get(0));
        if ($(textarea).attr('id') == 'creator') {
            if ($(textarea).val().length > 0) {
                $.post('/requestid', {
                    x: $('#x').val(),
                    content: $(textarea).val()
                }, (data,status) => {
                    if (status == 'success') {
                        $(textarea).attr('id', data.noteid);
                        $(textarea).attr('placeholder', '');
                        $('.options').html('<a onclick="share(this)">share</a> | <a onclick="deleteNote(this)">delete</a> | <a onclick="info(this)">info</a>');
                        $('#main').prepend('<div class="note"><textarea onblur="blurred(this)" onkeyup="updateTextArea(this)" id="creator" class="text" placeholder="Start typing your note..."></textarea><span class="options"></span></div>');
                        $('#creator').hide().slideDown(200);
                    } else {
                        alert('we fucked up bruh');
                    }
                });
            }
        } else {
            $.post('/requestsave', {id: $(textarea).attr('id'), content: $(textarea).val()},
                (data,status) => {console.log(data); console.log(status);});
        }
}


$(document).ready(() => {
    $('.nav').hover(() =>{
        $('.dd').slideDown(250);
    });
    $('.nav-wrapper').hover(() => {
        
    }, () => {
        $('.dd').slideUp(250);
    });
    $('.text').each(function(){
        textAreaAdjust($(this).get(0));
    });

});