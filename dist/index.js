let data = {
    name: 'Alex',
    email: 'kek228@mail.ru',
    second_name: 'March',
    cc_number: 'cc_number',
    inn: 'inn'
};
$(document).ready(function() {

    $('#publicate').one('click', function() {
        $('#forAppend').append('<div class="form-append"><div class="window"></div></div>');

        $.ajax({
            url: '/api/v1/getForm',
            type:'post',
            data: {
                'site': 'drom-drom.ru',
            },
            dataType: 'json',
            success: (res) => {
                let jsonForm = res.form;
                data = res.user;
                jsonForm.form =  jsonForm.form.substring(1, jsonForm.form.length);
                jsonForm.form =  jsonForm.form.substring(0, jsonForm.form.length - 1);

                appendForm(jsonForm.form);
            },
            error: (err) => {

            }
        });
    })

    $(document).one('submit', '#form-site', (e) => {
        e.preventDefault();
        let result = JSON.stringify($('form').serializeObject());
        $.ajax({
            url: '/mod',
            type:'post',
            data: {
                'query': result,
            },
            dataType: 'json',
            success: (res) => {
                $('.form-append').remove();
                $('#forAppend').append('<div style="color: #9AFF81; margin-top: 5px;">Отправлено</div>')
            },
            error: (err) => {
                console.log(err);
            }
        })
    })

});

function appendForm(html) {
    $('.window').append(html);
    convertForm();
}

function convertForm() {
    $(document).on('click', '#buttonResult', (e) => {
        let result = JSON.stringify($('form').serializeObject());
        alert('kek');
    })

    $('form').find('input').each(function() {
        $(this).val(data[$(this).attr('autocomplete')]);
        if ($(this).attr('type') === 'radio') {
            $(this).addClass('input-radio');
        } else if ($(this).attr('type') === 'checkbox') {
            $(this).addClass('input-checkbox');
        } else {
            $(this).addClass('h2 input');
        }
    });



    $('form').find('button').each(function() {
        $(this).addClass('button');
        if ($(this).attr('button-type') === 'button-save') {
            $(this).addClass('button-save');
        }
        if ($(this).attr('button-type') === 'button-cancel') {
            $(this).addClass('button-cancel');
        }
        if ($(this).attr('button-type') === 'button-radio') {
            $(this).addClass('button-radio');
        }
    });

    $('form').find('label').each(function() {
        $(this).addClass($(this).addClass('h3 label'));
    });

    $('form').find('div').each(function() {
        $(this).addClass($(this).addClass('form-div'));
    });

    $('form').find('text').each(function() {
        $(this).addClass($(this).addClass('h2'));
    });

}


$.fn.serializeObject = function() {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function() {
        if (o[this.name] !== undefined) {
            if (!o[this.name].push) {
                o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
        } else {
            o[this.name] = this.value || '';
        }
    });
    return o;
};
