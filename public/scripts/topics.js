function deletetopic(item) {
	topid = $(item).parent().attr('id');

	Swal.fire({
		title: 'Are you sure?',
		text: "All subtopics will be deleted too!",
		icon: 'warning',
		showCancelButton: true,
		confirmButtonText: 'Yes, delete it!'
	}).then((result) => {
		if (result.value) {
			$.ajax({
				method: 'POST',
				url: '/deltopic',
				data: { topicID: topid }
			})
				.done(function (data) {
					Swal.fire({
						title: 'Deleted Topic!',
						icon: 'success',
						showConfirmButton: false,
						timer: 1000
					});
					$(item).parent().remove();
				});
		}
	});
}

function newTopic() {
    Swal.fire({
        title: 'Name ',
        input: 'text',
        showCancelButton: true,
        confirmButtonText: 'Add topic',
        showLoaderOnConfirm: true,
        allowOutsideClick: () => !Swal.isLoading(),
        inputValidator: (value) => {
            if (!value) {
                return 'You need to write something!'
            }
        },
        preConfirm: (result) => {
            return $.ajax({
                type: 'POST',
                url: '/newtopic',
                data: { topic: result }
            }).done(function (data) {
                if (data.error) {
                    return data;
                }
                else {
                    $('#topiclist').append(`<li id="${data.topicid}">
                    <span class="dir topiclisttext">${data.topictitle}</span>
                    <button type="button" class="btn btn-sm btn-outline-light float-right" onclick="deletetopic(this)"
						style="margin-right: 11px;">
						<i class="fa fa-trash-alt text-dark"></i>
					</button> 
                    <ul class="subtopiclist">
                    </ul>
                </li>`);
                $("#subTopicName").text(data.topictitle);
                    return data;
                }
            });
        }
        ,
    }).then(result => {
        if (result.value.error) {
            Swal.fire({
                title: `${result.value.error}`,
                icon: 'error',
                showConfirmButton: false,
                timer: 1000
            });
        }
        else {
            Swal.fire({
                title: 'Topic Added!',
                icon: 'success',
                showConfirmButton: false,
                timer: 1000
            });
        }
    });

}

