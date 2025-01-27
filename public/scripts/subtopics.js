function saveSubtopic(Sarr) {

	$.ajax({
		type: 'POST',
		url: '/newsubtopic',
		data: { fc: Sarr.fc, codearr: Sarr.codearr, psuedoarr: Sarr.psuedoarr, topicid: Sarr.topicid, NewSubtopicName: Sarr.NewSubtopicName, description: Sarr.description }
	})
		.done(function (data) {
			if (data) {
				topid = data.topicid;
				subid = data.subtopicid;
				console.log("topid:" + topid);
				console.log("subid:" + subid);
				var newLi = `<li id="${data.subtopicid}">
							<span class="topiclisttext" onclick="loadSubtopic(this)">${Sarr.NewSubtopicName}</span>
							<button type="button" class="btn btn-sm btn-outline-light float-right"
								 data-created="${data.Screated}"
								onclick="showInfo(this)">
								<span class="fa fa-info text-light"></span>
							</button>
							<button type="button" class="btn btn-sm btn-outline-light float-right"
								onclick="deletesub(this)">
								<i class="fa fa-trash-alt text-light"></i>
							</button>
						</li>`
				$('#' + topid + " .subtopiclist").append(newLi);

				var title = $(`#${topid} .topiclisttext`).html() + " > " + Sarr.NewSubtopicName;
				$("#subTopicName").text(title);
				console.log("Subadded");
				Swal.fire({
					title: `New Sub ${Sarr.NewSubtopicName} added!`,
					icon: 'success',
					confirmButtonText: 'Nice'
				});
			}
			else {
				Swal.fire({
					title: 'Save failed',
					icon: 'error',
					showConfirmButton: false,
					timer: 600
				});
			}
		});
}

function updateSubtopic(Sarr) {
	$.ajax({
		type: 'POST',
		url: '/updatesubtopic',
		data: { fc: Sarr.fc, codearr: Sarr.codearr, psuedoarr: Sarr.psuedoarr, topicid: topid, UpTopNm: Sarr.UpTopNm, subtopicid: subid, UpSubNm: Sarr.UpSubNm, description: Sarr.description }
	}).done(function (data) {
		console.log(data);
		if (data.success) {
			var title = Sarr.UpTopNm + " > " + Sarr.UpSubNm;
			console.log(title);
			$("#subTopicName").text(title);
			$("#" + topid + " .topiclisttext").html(Sarr.UpTopNm);
			$("#" + subid + " .topiclisttext").html(Sarr.UpSubNm);
			console.log("Subdated");
			Swal.fire({
				title: 'Updated!',
				icon: 'success',
				confirmButtonText: 'Nice'
			});
		} else {
			Swal.fire({
				title: 'Update failed',
				icon: 'error',
				showConfirmButton: false,
				timer: 600
			});
		}

	});
}

function loadSubtopic(item) {
	subid = $(item).parent().attr('id');
	topid = $(item).parent().parent().parent().attr('id');
	$.ajax({
		type: 'GET',
		url: '/getsubtopic',
		data: { topicID: topid, sbtopicID: subid }
	}).done(function (data) {
		if (data) { loadBoard(data); }
		else {
			Swal.fire({
				title: 'Load failed',
				icon: 'error',
				showConfirmButton: false,
				timer: 600
			});
		}
	});
}

function deleteSubtopic(delsubid, deltopid, item) {
	$.ajax({
		method: 'POST',
		url: '/delsubtopic',
		data: { subtopicID: delsubid, topicID: deltopid }
	}).done(function (data) {
		if (data.success) {
			Swal.fire({
				title: 'Deleted Sub!',
				icon: 'success',
				showConfirmButton: false,
				timer: 1000
			});
			$(item).parent().remove();
		} else {
			Swal.fire({
				title: 'Delete failed',
				icon: 'error',
				showConfirmButton: false,
				timer: 600
			});
		}

	});
}