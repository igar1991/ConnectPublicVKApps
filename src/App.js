import React, { useState, useEffect } from 'react';
import connect from '@vkontakte/vk-connect';
import View from '@vkontakte/vkui/dist/components/View/View';
import ScreenSpinner from '@vkontakte/vkui/dist/components/ScreenSpinner/ScreenSpinner';
import '@vkontakte/vkui/dist/vkui.css';

import Home from './panels/Home';
import Persik from './panels/Persik';

const App = () => {
	const [activePanel, setActivePanel] = useState('home');
	const [fetchedUser, setUser] = useState(null);
	const [popout, setPopout] = useState(<ScreenSpinner size='large' />);
	const [token, setToken] = useState(null);
	const [usertoken, setUsertoken] = useState(null);
	const [selectedgroup, setSelectedgroup] = useState(null);


	
	const getTokenUser=()=> {
		connect.sendPromise("VKWebAppGetAuthToken", {"app_id": 7211685, "scope": "groups"}).then(result=> {

			console.log(result);
			setUsertoken(result.access_token);
		});
	}
	const selectedGroup=()=> {
		connect.sendPromise("VKWebAppCallAPIMethod", {
			"method": "groups.get",
			"params": { "v": "5.102", "access_token": usertoken, "filter":"admin" }
		  }).then(result=> {
			  console.log(result.response.items)
		  })
	}
	const getTokenGroup = () => {
		connect.sendPromise("VKWebAppGetCommunityAuthToken",
			{ "app_id": 7211685, "group_id": 187910128, "scope": "manage"}).then(result => {
				console.log(result.access_token)
				setToken(result.access_token);
			});
	}
	const addServergroup = () => {
		connect.sendPromise("VKWebAppCallAPIMethod", {
			"method": "groups.addCallbackServer",
			"params": { "v": "5.102", "group_id": 187910128, "url":"http://content-bot.tut.bike/vk-comment/vk", "title":"ChatBot", "access_token":token }
		  }).then(result=> {
			  console.log(result)
			  console.log(token)
		  })
	}

	useEffect(() => {
		connect.subscribe(({ detail: { type, data } }) => {
			if (type === 'VKWebAppUpdateConfig') {
				const schemeAttribute = document.createAttribute('scheme');
				schemeAttribute.value = data.scheme ? data.scheme : 'client_light';
				document.body.attributes.setNamedItem(schemeAttribute);
			}
		});
		async function fetchData() {
			const user = await connect.sendPromise('VKWebAppGetUserInfo');
			console.log(user);
			setUser(user);
			setPopout(null);
		}
		fetchData();
		getTokenUser();
		
		




	}, []);

	const go = e => {
		setActivePanel(e.currentTarget.dataset.to);
		connect.sendPromise("VKWebAppCallAPIMethod", {
			"method": "groups.get",
			"params": { "v": "5.102", "access_token": usertoken, "filter":"admin", "extended": 1 }
		  }).then(result=> {
			  
			  setSelectedgroup(result.response.items);
			  console.log(selectedgroup);

		  })
		
	};

	return (
		<View activePanel={activePanel} popout={popout}>
			<Home id='home' fetchedUser={fetchedUser} go={go}  />
			<Persik id='persik' go={go} selectedgroup={selectedgroup} />
			
		</View>
	);
}

export default App;

