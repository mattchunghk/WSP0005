console.log("js running");
window.onload = () => {

    init()
};

function init() {
    loadMemos();
    document
        .querySelector('#memo-form')
        .addEventListener('submit', submitMemoForm)
    document
        .querySelector('#admin-form')
        .addEventListener('submit', login)


}



async function loadMemos() {
    const res = await fetch('/memo'); // Fetch from the correct url
    const memos = await res.json();
    const memosContainer = document.querySelector('#memo-row');
    if (res.ok) {
        memosContainer.innerHTML = ''
        for (let memo of memos) {

            memosContainer.innerHTML +=
                ` 
                <div class="col-xxl-3 col-xl-4 col-lg-6 col-md-6
                col-sm-12 col-6">
            <div class="memo-box-none">
                <div class="trash"><i class="bi bi-trash3"></i></div>
                <div class="write"><i class="bi
                            bi-pencil-square"></i></div>
        
                <form method="post" action="">
        
                    <textarea class="memo">${memo.content}</textarea>
                </form>
            </div>
        </div>
    `
        }





        const memoDivs = [...document.querySelectorAll('.memo-box-none')];
        for (let index in memoDivs) {
            const memoDiv = memoDivs[index]

            memoDiv.querySelector('.trash').addEventListener('click', async(event) => {
                // Do your fetch  logic here
                console.log(memos[index].id);
                const res = await fetch(`/memo/delete/id/${memos[index].id}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                // console.log(res);
                if (res.ok) {
                    loadMemos()
                }
                // loadMemos();
            });

            memoDiv.querySelector('.write').addEventListener('click', async(event) => {
                // Do your fetch  logic here
                let text = memoDiv.querySelector('.memo').value
                const res = await fetch(`/memo/update/?index=${index}&update=${text}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });
                // console.log(res);
                if (res.ok) {
                    loadMemos()
                }
                // loadMemos();

            });



        }
    }

    // if (res.status(200)) {
    //     loadMemos();
    // }

    // loadMemos();
}






// document
//     .querySelector('#memo-form')
//     .addEventListener('submit', async function(event) {
//         document.querySelector('#memo-row').innerHTML += ` 
//         <div class="col-xxl-3 col-xl-4 col-lg-4 col-md-6
//         col-sm-12 col-6">
//     <div class="memo-box-none">
//         <div class="trash"><i class="bi bi-trash3"></i></div>
//         <div class="write"><i class="bi
//                     bi-pencil-square"></i></div>
//         <form method="post" action="">
//             <textarea class="memo">${memo.content}</textarea>
//         </form>
//     </div>
//     </div>

//          `


//     })




async function submitMemoForm(event) {
    event.preventDefault()

    // Serialize the Form afterwards
    const form = event.target
    const formData = new FormData()

    formData.append('memoText', form.memoText.value)
    formData.append('memoFile', form.memoFile.files[0])

    const res = await fetch('/memo-formidable', {
        method: 'POST',
        body: formData,
    })

    if (res.ok) {
        document.querySelector('#memo-form').reset()
        loadMemos()

    }

}




async function login(event) {

    event.preventDefault()

    // Serialize the Form afterwards
    const form = event.target
    const formObject = {}
    formObject['username'] = form.username.value
    formObject['password'] = form.password.value
    const res = await fetch('/admin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formObject),
        })
        // window.location = '/admin.html'


}












// Change the selector to select your memo input form
// document.querySelector('#memo-form')
//     .addEventListener('submit', (event) => {
//         event.preventDefault(); // To prevent the form from submitting synchronously
//         const form = event.target;
//         let formObject = {};
//         //... create your form object with the form inputs
//         const res = await fetch('/memo', {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify(formObject)
//         });

//         formObject['memoText'] = form.memoText.value
//         console.log(form.memoText.value);
//         formObject['memoFile'] = form.memoFile.value

//         const result = await res.json()
//         document.querySelector('#memo-result').innerHTML = result

//     });