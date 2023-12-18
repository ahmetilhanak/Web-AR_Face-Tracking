
import * as THREE from 'three';
import { MindARThree } from 'mindar-face-three';
import { loadGLTF, loadAudio, loadVideo } from 'loadgltf';

let canvasCapture = document.getElementById("forCapture");
let contextCapture = canvasCapture.getContext("2d");
let deneme;


document.addEventListener("DOMContentLoaded", () => {

  let anchorArray = [];
  let groupArray = [];
  let modelArray = [];
  var anchor = {};
  var model = {};
  let mindarThree;
  let sceneArray = [];
  let rendererArray = [];



  const start = async (gltfObjectName, meshSpotNumber = 168) => {
    mindarThree = new MindARThree({                   /// similar to one => const mindarThree = new window.MINDAR.IMAGE.MindARThree({  
      // container: document.body,
      container: document.querySelector("#secondDiv"),
    });

    const { renderer, scene, camera } = mindarThree;

    const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
    scene.add(light);

    const occluder = await loadGLTF("models/sparkar-occluder/headOccluder.glb");
    const occluderMaterial = new THREE.MeshBasicMaterial({ colorWrite: false });
    occluder.scene.traverse((o) => {
      if (o.isMesh) {
        o.material = occluderMaterial;
      }
    });
    occluder.scene.scale.multiplyScalar(0.065);
    occluder.scene.position.set(0, -0.3, 0.15);
    occluder.scene.renderOrder = 0;
    const occluderAnchor = mindarThree.addAnchor(168);
    occluderAnchor.group.add(occluder.scene);

    let myGltf = await loadGLTF(`models/${gltfObjectName}/scene.gltf`);



    model[gltfObjectName] = myGltf.scene;
    model[gltfObjectName].renderOrder = 1;
    model[gltfObjectName].scale.set(0.0075, 0.0075, 0.0075);

    anchor[gltfObjectName] = mindarThree.addAnchor(meshSpotNumber);   //  meshSpotNumber=168 => middle of the two eyes
    anchor[gltfObjectName].group.add(model[gltfObjectName]);
    anchor[gltfObjectName].group.name = gltfObjectName;

    addCheckbox(gltfObjectName);

    await mindarThree.start();

    renderer.setAnimationLoop(() => {
      renderer.render(scene, camera);
    });
    sceneArray.push(scene);
    let scaleValue;
    let moveValue;
    let rotateValue;

    let setValues = () => {
      let inputElementScale = document.querySelector("#scaleValue");
      scaleValue = parseFloat(inputElementScale.value);

      let inputElementMove = document.querySelector("#moveValue");
      moveValue = parseFloat(inputElementMove.value);

      let inputElementRotate = document.querySelector("#rotationValue");
      rotateValue = parseFloat(inputElementRotate.value);

  
    }

    let animationControl = function (par, obj = gltfObjectName) {
      let myModel = model[obj];
      setValues();

      if (par == "refresh") {
        myModel.rotation.set(0, 0, 0);
        myModel.scale.set(0.0075, 0.0075, 0.0075);
        myModel.position.set(0, 0, 0);

      } else if (par == "left") {
        myModel.rotation.set(myModel.rotation.x, myModel.rotation.y - rotateValue, myModel.rotation.z);
      } else if (par == "right") {
        myModel.rotation.set(myModel.rotation.x, myModel.rotation.y + rotateValue, myModel.rotation.z);
      }
      else if (par == "up") {
        myModel.rotation.set(myModel.rotation.x - rotateValue, myModel.rotation.y, myModel.rotation.z);
      }
      else if (par == "down") {
        myModel.rotation.set(myModel.rotation.x + rotateValue, myModel.rotation.y, myModel.rotation.z);
      }
      else if (par == "leftMove") {
        myModel.position.set(myModel.position.x - moveValue, myModel.position.y, myModel.position.z);
      }
      else if (par == "rightMove") {
        myModel.position.set(myModel.position.x + moveValue, myModel.position.y, myModel.position.z);
      }
      else if (par == "upMove") {
        myModel.position.set(myModel.position.x, myModel.position.y + moveValue, myModel.position.z);
      }
      else if (par == "downMove") {
        myModel.position.set(myModel.position.x, myModel.position.y - moveValue, myModel.position.z);
      }
      else if (par == "inMove") {
        myModel.position.set(myModel.position.x, myModel.position.y, myModel.position.z - moveValue);
      }
      else if (par == "outMove") {
        myModel.position.set(myModel.position.x, myModel.position.y, myModel.position.z + moveValue);
      }
      else if (par == "minus") {
        myModel.scale.set(myModel.scale.x - scaleValue, myModel.scale.y - scaleValue, myModel.scale.z - scaleValue);
      }
      else if (par == "plus") {
        myModel.scale.set(myModel.scale.x + scaleValue, myModel.scale.y + scaleValue, myModel.scale.z + scaleValue);
      }

    };
    animationControl("rotate");

    document.querySelectorAll(".playButton").forEach(z => {
      z.addEventListener("click", () => {

        var functionPar = z.id.split("-")[1];

        
        if (document.querySelectorAll(".checkingBox").length > 0) {
          document.querySelectorAll(".checkingBox").forEach(z => {
            
            if (z.checked) {
              animationControl(functionPar, z.id);
            }
          });
        };


      })
    });

  };

  const capture = (mindarThree) => {
    const { video, renderer, scene, camera } = mindarThree;
    
    canvasCapture.width = renderer.domElement.width;
    canvasCapture.height = renderer.domElement.height;


    renderer.preserveDrawingBuffer = true;

    const sx = (video.clientWidth - renderer.domElement.clientWidth) / 2 * video.videoWidth / video.clientWidth;
    const sy = (video.clientHeight - renderer.domElement.clientHeight) / 2 * video.videoHeight / video.clientHeight;
    const sw = video.videoWidth - sx * 2;
    const sh = video.videoHeight - sy * 2;



    contextCapture.drawImage(video, sx, sy, sw, sh, 0, 0, canvasCapture.width, canvasCapture.height);

    renderer.preserveDrawingBuffer = true;

    
    rendererArray.push(renderer);

    console.log(sceneArray);

    rendererArray.forEach(z => {
      z.render(sceneArray[rendererArray.indexOf(z)], camera);
      contextCapture.drawImage(z.domElement, 0, 0, canvasCapture.width, canvasCapture.height);
    });


    console.dir(renderer.domElement);
    renderer.preserveDrawingBuffer = false;

    const link = document.createElement("a");
    link.download = "photo.png";
    link.href = canvasCapture.toDataURL("image/png");
    link.click();

  };

  document.querySelector("#capture").addEventListener("click", () => {
    capture(mindarThree);
    console.log("it works");

  });

  
  document.querySelectorAll(".clickImage").forEach(z => {
    z.addEventListener("click", () => {
      

      var functionPar = z.id.split("-")[1];
   
      if (!model.hasOwnProperty(functionPar)) {
        start(functionPar);
      } else {
        alert("You already have it");
      }
     
    })
  });

  let addCheckbox = (checkPar) => {


    function confirmAsk() {
      if (confirm('You want to remove that, Are you sure?')) {
        //action confirmed
        console.log('Ok is clicked.');

        let divID = checkPar + "Div";
        let willBeDeleted = document.querySelector("#" + divID);
        console.log(divID);
        console.log(willBeDeleted);
        document.querySelector(".checkboxDiv").removeChild(willBeDeleted);

        anchor[checkPar].group.remove(model[checkPar]);
        delete model[checkPar];

      } else {
        //action cancelled
        console.log('Cancel is clicked.');



      }
    };

  
    var deleteContainer = document.createElement("div");
    deleteContainer.className = "delete-container";

    var removeButton = document.createElement("button");
    removeButton.innerHTML = "X";
    removeButton.addEventListener("click", confirmAsk);
    removeButton.id = "checkParRemoveButton";

    deleteContainer.appendChild(removeButton);


    ////



    var x = document.createElement("INPUT");
    x.setAttribute("type", "checkbox");
    x.id = checkPar;
    x.className = "checkingBox";
    x.style = {
      width: "20px",
      height: "20px",
      marginLeft: "10px"
    };

    var y = document.createElement("LABEL");
    let labelInnerHTML = (checkPar[0].toUpperCase()).concat(checkPar.slice(1));
    y.innerHTML = labelInnerHTML;
    y.style.marginLeft = "5px";
    y.style.marginRight = "20px";

    var z = document.createElement("div");
    z.className = "gltfCheckBoxes";
    z.id = checkPar + "Div";

    z.appendChild(deleteContainer);
    z.appendChild(y);
    z.appendChild(x);


    document.querySelector(".checkboxDiv").appendChild(z);

  };

  start("glasses1", 168);

 
});






