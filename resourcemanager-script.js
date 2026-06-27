let resources = [

    {
        id: "R001",
        name: "Portable Projector Set",
        type: "Equipment",
        location: "Block A",
        capacity: 1,
        features: "HDMI Cable, Remote Control, Carry Case",
        availability: "Available",
        status: "Available"
    },


    {
        id: "R002",
        name: "Computer Lab 2",
        type: "Computer Lab",
        location: "Block B",
        capacity: 40,
        features: "40 Computers, Projector, WiFi",
        availability: "Available",
        status: "Available"
    },


    {
        id: "R003",
        name: "Lecture Hall A",
        type: "Classroom",
        location: "Block A",
        capacity: 120,
        features: "Projector, Microphone, Smart Board",
        availability: "Available",
        status: "Available"
    },


    {
        id: "R004",
        name: "Design Studio",
        type: "Studio",
        location: "Block C",
        capacity: 35,
        features: "Drawing Tables, Display Board",
        availability: "Maintenance",
        status: "Under Maintenance"
    }


];

let bookingRequests = [

    {
        id:"BK001",
        user:"Dr. Ahmad",
        resource:"Portable Projector Set",
        date:"2026-06-20",
        start:"10:00",
        end:"12:00",
        status:"Pending Approval"
    },


    {
        id:"BK002",
        user:"Ms. Sarah",
        resource:"Computer Lab 2",
        date:"2026-06-22",
        start:"14:00",
        end:"16:00",
        status:"Pending Approval"
    },


    {
        id:"BK003",
        user:"Mr. Daniel",
        resource:"Lecture Hall A",
        date:"2026-06-25",
        start:"09:00",
        end:"11:00",
        status:"Approved"
    }

];


let maintenanceList = [

    {
        resource:"Design Studio",
        date:"2026-06-15",
        status:"Completed",
        notes:"Display board replacement"
    }

];

let notifications = [

    {
        title:"New Booking Request",
        message:"Portable Projector Set requires approval.",
        type:"warning",
        time:"Today, 10:30 AM",
        read:false
    },


    {
        title:"Maintenance Completed",
        message:"Design Studio maintenance has been completed.",
        type:"success",
        time:"Yesterday",
        read:true
    }


];

function showPage(pageId, button){


    const pages =
    document.querySelectorAll(".page");


    const buttons =
    document.querySelectorAll(".menu-btn");



    pages.forEach(page=>{

        page.classList.remove("active-page");

    });



    buttons.forEach(btn=>{

        btn.classList.remove("active");

    });



    const selected =
    document.getElementById(pageId);



    if(selected){

        selected.classList.add("active-page");

    }



    if(button){

        button.classList.add("active");

    }



    window.scrollTo(0,0);



    if(pageId==="resources"){

        displayResources(resources);

    }



    if(pageId==="approve-booking"){

        renderApprovalTable();

    }



    if(pageId==="notifications"){

        renderNotifications();

    }


}

function formatDate(date){


    return new Date(date).toLocaleDateString(
        "en-GB",
        {
            day:"2-digit",
            month:"short",
            year:"numeric"
        }
    );

}

function updateDashboardCounts(){


    let totalResources =
    resources.length;



    let totalBookings =
    bookingRequests.length;



    let pending =
    bookingRequests.filter(
        b=>b.status==="Pending Approval"
    ).length;



    let maintenance =
    resources.filter(
        r=>r.status==="Under Maintenance"
    ).length;




    if(document.getElementById("totalResources"))

        document.getElementById("totalResources")
        .textContent=totalResources;



    if(document.getElementById("totalBookings"))

        document.getElementById("totalBookings")
        .textContent=totalBookings;



    if(document.getElementById("pendingApprovalCount"))

        document.getElementById("pendingApprovalCount")
        .textContent=pending;



    if(document.getElementById("maintenanceCount"))

        document.getElementById("maintenanceCount")
        .textContent=maintenance;



}

function displayResources(list){


    const container =
    document.getElementById("resourceList");



    if(!container) return;



    container.innerHTML="";



    list.forEach(resource=>{


        let badge =
        resource.status==="Available"
        ?
        "available-badge"
        :
        "unavailable-badge";



        container.innerHTML += `

        <div class="resource-card">


            <div class="resource-card-header">

                <div>

                    <h3>
                    ${resource.name}
                    </h3>


                    <span class="resource-type">
                    ${resource.type}
                    </span>

                </div>


                <span class="${badge}">
                ${resource.status}
                </span>


            </div>



            <div class="resource-info">

                <strong>ID:</strong>
                ${resource.id}
                <br>


                <strong>Location:</strong>
                ${resource.location}
                <br>


                <strong>Capacity:</strong>
                ${resource.capacity}
                <br>


                <strong>Features:</strong>
                ${resource.features}


            </div>



            <div class="resource-actions">


                <button onclick="
                viewResource('${resource.id}')
                ">
                View
                </button>


                <button onclick="
                editResource('${resource.id}')
                ">
                Edit
                </button>


                <button onclick="
                changeStatus('${resource.id}')
                ">
                Status
                </button>


            </div>



        </div>


        `;


    });


}

function viewResource(id){


    const resource =
    resources.find(
        r=>r.id===id
    );


    const box =
    document.getElementById(
        "resourceDetails"
    );



    if(!resource || !box)
        return;



    box.innerHTML = `

    <div class="details-box">


        <h3>
        ${resource.name}
        </h3>


        <p>

        <strong>ID:</strong>
        ${resource.id}

        <br>


        <strong>Type:</strong>
        ${resource.type}

        <br>


        <strong>Location:</strong>
        ${resource.location}

        <br>


        <strong>Status:</strong>
        ${resource.status}

        </p>


    </div>

    `;


}

updateDashboardCounts();

displayResources(resources);

function openEditResource(resourceId) {

    const resource = resources.find(item => item.id === resourceId);

    if (!resource) return;


    document.getElementById("editResourcePanel").classList.remove("hidden");


    document.getElementById("editResourceId").value = resource.id;
    document.getElementById("editResourceName").value = resource.name;
    document.getElementById("editResourceType").value = resource.type;
    document.getElementById("editResourceCapacity").value = resource.capacity;
    document.getElementById("editResourceLocation").value = resource.location;
    document.getElementById("editResourceFacilities").value = resource.facilities;


    document
    .getElementById("editResourcePanel")
    .scrollIntoView({
        behavior:"smooth"
    });

}



function saveResourceChanges(event){

    event.preventDefault();


    const id =
    document.getElementById("editResourceId").value;


    const resource =
    resources.find(item=>item.id===id);



    if(!resource){
        return;
    }



    const name =
    document.getElementById("editResourceName").value.trim();


    const type =
    document.getElementById("editResourceType").value;


    const capacity =
    document.getElementById("editResourceCapacity").value;


    const location =
    document.getElementById("editResourceLocation").value.trim();


    const facilities =
    document.getElementById("editResourceFacilities").value.trim();



    if(
        name==="" ||
        location==="" ||
        capacity===""
    ){

        alert(
        "Please complete all required information."
        );

        return;
    }



    resource.name=name;
    resource.type=type;
    resource.capacity=Number(capacity);
    resource.location=location;
    resource.facilities=facilities;



    addNotification(
        "Resource Updated",
        `${resource.name} details have been updated.`,
        "success"
    );


    renderResources();
    closeEditResource();



    alert(
    "Resource information updated successfully."
    );

}




function closeEditResource(){

    const panel =
    document.getElementById(
    "editResourcePanel"
    );


    if(panel){

        panel.classList.add("hidden");

    }

}

function openStatusManagement(resourceId){


    const resource =
    resources.find(item=>item.id===resourceId);


    if(!resource)return;



    document.getElementById(
    "statusResourceId"
    ).value=resource.id;



    document.getElementById(
    "statusResourceName"
    ).textContent=
    resource.name;



    document.getElementById(
    "resourceStatus"
    ).value=
    resource.status;



    document.getElementById(
    "statusPanel"
    ).classList.remove(
    "hidden"
    );



    document
    .getElementById("statusPanel")
    .scrollIntoView({
        behavior:"smooth"
    });


}



function saveResourceStatus(event){

event.preventDefault();



const id =
document.getElementById(
"statusResourceId"
).value;



const resource =
resources.find(
item=>item.id===id
);



if(!resource)return;



const newStatus =
document.getElementById(
"resourceStatus"
).value;



resource.status=newStatus;



if(newStatus==="Under Maintenance"){

    addNotification(
    "Resource Maintenance",
    `${resource.name} has been marked under maintenance.`,
    "warning"
    );

}

else if(newStatus==="Available"){


    addNotification(
    "Resource Available",
    `${resource.name} is now available for booking.`,
    "success"
    );

}



renderResources();

closeStatusPanel();



alert(
"Resource status updated."
);


}





function closeStatusPanel(){

const panel =
document.getElementById(
"statusPanel"
);


if(panel){

panel.classList.add(
"hidden"
);

}


}

function scheduleMaintenance(event){

event.preventDefault();



const resourceId =
document.getElementById(
"maintenanceResource"
).value;



const date =
document.getElementById(
"maintenanceDate"
).value;



const reason =
document.getElementById(
"maintenanceReason"
).value.trim();



const resource =
resources.find(
item=>item.id===resourceId
);



if(!resource){

alert(
"Please select a resource."
);

return;

}



if(date===""){

alert(
"Please select maintenance date."
);

return;

}




resource.status="Under Maintenance";

resource.maintenanceDate=date;

resource.maintenanceReason=reason;



addNotification(
"Maintenance Scheduled",
`${resource.name} will be unavailable on ${date}.`,
"warning"
);



renderResources();



document
.getElementById(
"maintenanceForm"
)
.reset();



alert(
"Maintenance schedule saved."
);



}

function renderPendingBookings(){


const table =
document.getElementById(
"pendingBookingTable"
);



if(!table)return;



table.innerHTML="";



const pending =
bookings.filter(
booking=>
booking.status==="Pending Approval"
);



if(pending.length===0){

table.innerHTML=
`
<tr>
<td colspan="7">
No pending booking requests.
</td>
</tr>
`;

return;

}




pending.forEach(booking=>{


table.innerHTML +=

`
<tr>

<td>${booking.id}</td>

<td>${booking.resource}</td>

<td>${booking.date}</td>

<td>
${booking.startTime}
-
${booking.endTime}
</td>

<td>${booking.purpose}</td>


<td>
<span class="status pending">
Pending Approval
</span>
</td>


<td>


<button
class="table-btn"
onclick="
approveBooking('${booking.id}')
">
Approve
</button>



<button
class="table-btn danger-btn"
onclick="
rejectBooking('${booking.id}')
">
Reject
</button>



</td>


</tr>
`;

});


}





function approveBooking(id){


const booking =
bookings.find(
item=>item.id===id
);



if(!booking)return;



booking.status="Confirmed";



addNotification(
"Booking Approved",
`${booking.id} has been approved.`,
"success"
);



renderPendingBookings();

refreshTables();



alert(
"Booking approved."
);


}




function rejectBooking(id){


const booking =
bookings.find(
item=>item.id===id
);



if(!booking)return;



booking.status="Cancelled";



addNotification(
"Booking Rejected",
`${booking.id} has been rejected.`,
"danger"
);



renderPendingBookings();

refreshTables();



alert(
"Booking rejected."
);


}

function registerResource(event){

    event.preventDefault();


    const name =
    document.getElementById("resourceName").value.trim();


    const type =
    document.getElementById("resourceType").value;


    const capacity =
    document.getElementById("resourceCapacity").value;


    const location =
    document.getElementById("resourceLocation").value.trim();


    const facilities =
    document.getElementById("resourceFacilities").value.trim();



    const availability =
    document.getElementById("resourceAvailability").value;



    const result =
    document.getElementById("resourceRegisterResult");


    if(
        name === "" ||
        type === "" ||
        capacity === "" ||
        location === ""
    ){

        result.innerHTML =

        `
        <div class="result-box">
            <h3>Registration Failed</h3>

            <p>
            Please complete all required fields before submitting.
            </p>

        </div>
        `;

        return;
    }


    const duplicate =
    resources.some(resource =>

        resource.name.toLowerCase()
        ===
        name.toLowerCase()

    );



    if(duplicate){


        result.innerHTML =

        `
        <div class="result-box">
            <h3>Duplicate Resource</h3>

            <p>
            A resource with this name already exists.
            </p>

        </div>
        `;


        return;

    }


    const resourceId =
    "R00" + (resources.length + 1);

    const newResource = {


        id:resourceId,

        name:name,

        type:type,

        capacity:Number(capacity),

        location:location,

        facilities:
        facilities || "No additional features",


        status:
        availability,


        approval:
        "Approval required"


    };




    resources.push(newResource);





    renderResources();

    updateResourceCounts();




    addNotification(

        "New Resource Registered",

        `${name} has been successfully added.`,

        "success"

    );




    result.innerHTML =


    `
    <div class="result-box success-result">

        <h3>
        Resource Registered Successfully
        </h3>


        <p>

        <strong>Resource ID:</strong>
        ${resourceId}

        <br>


        <strong>Name:</strong>
        ${name}

        <br>


        <strong>Type:</strong>
        ${type}

        <br>


        <strong>Status:</strong>
        ${availability}


        </p>


    </div>

    `;



    document
    .getElementById("resourceRegisterForm")
    .reset();



}

function renderResources(){


const container =
document.getElementById(
"resourceManagerList"
);



if(!container)return;



container.innerHTML="";



if(resources.length===0){

container.innerHTML=
`
<p>
No resources registered.
</p>
`;

return;

}




resources.forEach(resource=>{


let statusClass =
"available-badge";



if(resource.status==="Unavailable"
||
resource.status==="Under Maintenance"){

statusClass =
"unavailable-badge";

}



container.innerHTML +=


`

<div class="resource-card">


<div class="resource-card-header">


<div>

<h3>
${resource.name}
</h3>


<span class="resource-type">

${resource.type}

</span>


</div>



<span class="${statusClass}">

${resource.status}

</span>



</div>





<div class="resource-info">


<strong>
Resource ID:
</strong>

${resource.id}

<br>


<strong>
Location:
</strong>

${resource.location}


<br>


<strong>
Capacity:
</strong>

${resource.capacity}


<br>


<strong>
Facilities:
</strong>

${resource.facilities}



</div>






<div class="resource-actions">


<button

onclick="
openEditResource('${resource.id}')
">

Edit

</button>



<button

onclick="
openStatusManagement('${resource.id}')
">

Manage Status

</button>




<button

class="danger-btn"

onclick="
deleteResource('${resource.id}')
">

Delete

</button>


</div>




</div>


`;



});



}

function deleteResource(resourceId){


const resource =
resources.find(
item=>item.id===resourceId
);



if(!resource)return;



const confirmDelete =
confirm(
`Remove ${resource.name}?`
);



if(!confirmDelete)return;



const index =
resources.findIndex(
item=>item.id===resourceId
);



resources.splice(index,1);



renderResources();


updateResourceCounts();



addNotification(

"Resource Removed",

`${resource.name} has been removed.`,

"danger"

);



}

function searchManagerResources(){


const keyword =

document
.getElementById(
"resourceManagerSearch"
)
.value
.toLowerCase();




const filtered =

resources.filter(resource =>


resource.name
.toLowerCase()
.includes(keyword)


||

resource.type
.toLowerCase()
.includes(keyword)


||

resource.location
.toLowerCase()
.includes(keyword)


);



renderFilteredResources(filtered);



}




function renderFilteredResources(list){


const container =
document.getElementById(
"resourceManagerList"
);



if(!container)return;



container.innerHTML="";



list.forEach(resource=>{


container.innerHTML +=


`

<div class="resource-card">


<h3>
${resource.name}
</h3>


<p>

<strong>
Type:
</strong>
${resource.type}

<br>


<strong>
Location:
</strong>
${resource.location}


<br>


<strong>
Status:
</strong>
${resource.status}


</p>


<button

onclick="
openEditResource('${resource.id}')
">

Edit

</button>


<button

onclick="
openStatusManagement('${resource.id}')
">

Status

</button>



</div>


`;



});


}

function updateResourceCounts(){


const total =
resources.length;



const available =

resources.filter(

resource=>

resource.status==="Available"

).length;



const maintenance =

resources.filter(

resource=>

resource.status==="Under Maintenance"

).length;



const unavailable =

resources.filter(

resource=>

resource.status==="Unavailable"

).length;




const totalBox =
document.getElementById(
"totalResourceCount"
);



const availableBox =
document.getElementById(
"availableResourceCount"
);



const maintenanceBox =
document.getElementById(
"maintenanceResourceCount"
);



const unavailableBox =
document.getElementById(
"unavailableResourceCount"
);




if(totalBox)
totalBox.textContent=total;



if(availableBox)
availableBox.textContent=available;



if(maintenanceBox)
maintenanceBox.textContent=maintenance;



if(unavailableBox)
unavailableBox.textContent=unavailable;



}

renderResources();

updateResourceCounts();
function checkResourceAvailability(resourceId){


const resource =
resources.find(
item => item.id === resourceId
);



if(!resource) return;



const date =
document.getElementById(
"availabilityDate"
).value;



const startTime =
document.getElementById(
"availabilityStart"
).value;



const endTime =
document.getElementById(
"availabilityEnd"
).value;



const result =
document.getElementById(
"availabilityResult"
);




if(date === "" || startTime === "" || endTime === ""){


result.innerHTML =

`
<div class="result-box">

<h3>
Missing Information
</h3>


<p>
Please select date and time before checking availability.
</p>


</div>
`;

return;

}





if(startTime >= endTime){


result.innerHTML =

`
<div class="result-box">

<h3>
Invalid Time
</h3>


<p>
End time must be later than start time.
</p>


</div>
`;

return;

}





if(resource.status === "Under Maintenance"){


result.innerHTML =

`
<div class="result-box">

<h3>
Resource Under Maintenance
</h3>


<p>
${resource.name} cannot be booked during maintenance.
</p>


</div>
`;

return;


}





const conflict = bookings.some(booking =>


booking.resource === resource.name

&&

booking.date === date

&&

booking.status !== "Cancelled"

&&

(
startTime < booking.endTime
&&
endTime > booking.startTime
)

);





if(conflict){


result.innerHTML =

`
<div class="result-box">

<h3>
Time Slot Unavailable
</h3>


<p>
Another booking already exists during this period.
</p>


</div>
`;

return;

}





result.innerHTML =

`
<div class="result-box success-result">

<h3>
Resource Available
</h3>


<p>

${resource.name}
is available on

${date}

from

${startTime}

to

${endTime}.


</p>


</div>

`;



}
function approveEquipmentBooking(bookingId){


const booking =

bookings.find(
item=>item.id===bookingId
);



if(!booking)return;




const resource =

resources.find(
item=>item.name===booking.resource
);



if(!resource)return;

if(
resource.status==="Under Maintenance"
||
resource.status==="Unavailable"
){


booking.status="Cancelled";



addNotification(

"Booking Rejected",

`${booking.id} rejected because resource is unavailable.`,

"danger"

);



renderPendingBookings();

refreshTables();



return;

}
const conflict = bookings.some(item =>


item.id !== booking.id

&&

item.resource === booking.resource

&&

item.date === booking.date

&&

item.status === "Confirmed"

&&

(
booking.startTime < item.endTime
&&

booking.endTime > item.startTime

)

);





if(conflict){


addNotification(

"Booking Conflict",

`${booking.id} has a conflict with another booking.`,

"warning"

);



alert(
"Cannot approve. Booking conflict detected."
);



return;

}






booking.status="Confirmed";



addNotification(

"Booking Approved",

`${booking.id} has been approved successfully.`,

"success"

);



renderPendingBookings();

refreshTables();



alert(
"Booking approved successfully."
);



}








function rejectEquipmentBooking(bookingId){


const booking =

bookings.find(
item=>item.id===bookingId
);



if(!booking)return;




booking.status="Cancelled";




addNotification(

"Booking Rejected",

`${booking.id} was rejected by Resource Manager.`,

"danger"

);




renderPendingBookings();

refreshTables();



alert(
"Booking request rejected."
);



}

function viewBookingRequest(bookingId){


const booking =

bookings.find(
item=>item.id===bookingId
);



if(!booking)return;



const box =
document.getElementById(
"bookingRequestDetails"
);



box.innerHTML =


`

<div class="details-box">


<h3>
Booking Request Details
</h3>


<p>


<strong>
Booking ID:
</strong>

${booking.id}


<br>



<strong>
Resource:
</strong>

${booking.resource}



<br>



<strong>
Date:
</strong>

${booking.date}



<br>



<strong>
Time:
</strong>

${booking.startTime}

-

${booking.endTime}



<br>



<strong>
Purpose:
</strong>

${booking.purpose}



<br>



<strong>
Attendees:
</strong>

${booking.attendees}



<br>



<strong>
Status:
</strong>

${booking.status}



</p>



</div>

`;



}



function updateStatusOptions(){


const select =

document.getElementById(
"resourceStatus"
);



if(!select)return;



select.innerHTML =


`

<option>
Available
</option>


<option>
Unavailable
</option>


<option>
Under Maintenance
</option>


`;



}

let notifications = [];





function addNotification(title,message,type){



notifications.unshift({

title:title,

message:message,

type:type,

time:"Just now",

read:false


});



renderNotifications();



updateNotificationCount();



}







function renderNotifications(){


const list =

document.getElementById(
"notificationList"
);



if(!list)return;



list.innerHTML="";




if(notifications.length===0){


list.innerHTML=

`
<p>
No notifications available.
</p>
`;

return;

}




notifications.forEach(notification=>{


list.innerHTML +=


`

<div class="notification-item">


<div class="notification-icon">


${

notification.type==="success"
?
"✓"
:
notification.type==="danger"
?
"×"
:
"!"

}


</div>



<div>


<h3>
${notification.title}
</h3>


<p>
${notification.message}
</p>


<span>
${notification.time}
</span>


</div>


</div>


`;



});



}






function updateNotificationCount(){


const count =

notifications.filter(
item=>!item.read
).length;



const badge =

document.getElementById(
"notificationCount"
);



if(badge){

badge.textContent=count;

}



}







function markNotificationRead(){


notifications.forEach(item=>{


item.read=true;


});


updateNotificationCount();


renderNotifications();


}


document.addEventListener(
"DOMContentLoaded",
()=>{


renderResources();


renderPendingBookings();


updateResourceCounts();


updateNotificationCount();


updateStatusOptions();



}
);