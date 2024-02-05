// import {Buffer} from 'buffer';
// import {TextEncoder} from 'web-encoding';
import _ from 'lodash';
import axios from 'axios';


export function removeAxiosAuthHeader() {
  delete axios.defaults.headers.common['Authorization'];
}