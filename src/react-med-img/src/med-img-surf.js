import vtkActor from 'vtk.js/Sources/Rendering/Core/Actor';
import vtkRenderWindow from 'vtk.js/Sources/Rendering/Core/RenderWindow';
import vtkRenderer from 'vtk.js/Sources/Rendering/Core/Renderer';
import vtkLight from 'vtk.js/Sources/Rendering/Core/Light';
import vtkOpenGLRenderWindow from 'vtk.js/Sources/Rendering/OpenGL/RenderWindow';
import vtkRenderWindowInteractor from 'vtk.js/Sources/Rendering/Core/RenderWindowInteractor';
import vtkInteractorStyleTrackballCamera from 'vtk.js/Sources/Interaction/Style/InteractorStyleTrackballCamera';
import vtkMapper from 'vtk.js/Sources/Rendering/Core/Mapper';
import vtkPolyDataReader from 'vtk.js/Sources/IO/Legacy/PolyDataReader';
import React, { Component } from 'react'
import ReactDOM from 'react-dom';
// import PropTypes from 'prop-types'

import MedImgService from './med-img-service';

import _ from 'underscore';
import { connect } from "react-redux";
import { withRouter } from 'react-router-dom';
// import {Row, Card, Col, Container, ButtonToolbar, ButtonGroup, Button, ProgressBar} from 'react-bootstrap';
import {Col} from 'react-bootstrap';
// import {Eye, DownloadCloud, RefreshCw, Play, Delete, StopCircle, ArrowLeftCircle, ArrowRightCircle} from 'react-feather';
import qs from 'query-string';

class MedImgSurf extends Component {

  constructor(props){
    super(props)
    
    this.state = {
      instances: [], 
      background: this.props.background? this.props.background: [0, 0, 0],
      data: this.props.data
    }
  }

  componentDidMount(){
    const {
      location
    } = this.props

    const self = this;

    const {data} = self.state

    this.medimgservice = new MedImgService();
    this.medimgservice.setHttp(this.props.http);

	// ----------------------------------------------------------------------------
	// Standard rendering code setup
	// ----------------------------------------------------------------------------

    const renderWindow = vtkRenderWindow.newInstance();
    const renderer = vtkRenderer.newInstance();
    renderWindow.addRenderer(renderer);

    // const light = vtkLight.newInstance()
    // light.setLightType('HeadLight');
    // renderer.addLight(light);
    // renderer.setLightFollowCamera(true);

    const openglRenderWindow = vtkOpenGLRenderWindow.newInstance();
    renderWindow.addView(openglRenderWindow);
    const node = ReactDOM.findDOMNode(this.ref);

    openglRenderWindow.setContainer(node);


    const interactor = vtkRenderWindowInteractor.newInstance();

    const iStyle = vtkInteractorStyleTrackballCamera.newInstance();

    interactor.setInteractorStyle(iStyle);
    interactor.setView(openglRenderWindow);
    interactor.initialize();

    interactor.bindEvents(node);

    const reader = vtkPolyDataReader.newInstance();

    const camera = renderer.getActiveCamera();
    // camera.setPosition(...position);

    Promise.all(_.map(data, function(surf){
      return self.medimgservice.getPublicSurf(surf.surf)
      .then(function(res){
        reader.parseAsText(res.data);
        
        const polydata = reader.getOutputData();
        const mapper = vtkMapper.newInstance();
        const actor = vtkActor.newInstance();

        actor.setMapper(mapper);
        if(surf.color){
          actor.getProperty().setColor(..._.map(surf.color, (c)=>{return c/255}));
        }
        
        if(surf.representation != undefined){
          actor.getProperty().setRepresentation(surf.representation);
        }
        if(surf.opacity != undefined){
          actor.getProperty().setOpacity(surf.opacity);
        }
        actor.getProperty().setInterpolationToPhong();
        mapper.setInputData(polydata);

        renderer.addActor(actor);
        renderer.setBackground(self.state.background)

        const position = camera.getFocalPoint();
        
        renderer.resetCamera();
        renderWindow.render();
      })
    }))
    .then(function(){
      self.azimuth(renderWindow, camera, 0.1)
    });
  }

  azimuth(renderWindow, camera, angle){
    const self = this;
    camera.azimuth(angle);
    setTimeout(function(){
      self.azimuth(renderWindow, camera, angle);
      renderWindow.render();
    },10)
  }

  render() {
    const {
      location
    } = this.props;

    return (
      <Col ref={(node) => {this.ref = node}}>
        
      </Col>
      )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    http: state.jwtAuthReducer.http
  }
}

export default withRouter(connect(mapStateToProps)(MedImgSurf));