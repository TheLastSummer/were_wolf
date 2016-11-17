import StateConst from '../consts/roomstate';
import Toast from 'antd-mobile/lib/toast';

function delay(timeout) {
    return new Promise(resolve => {
        setTimeout(resolve, timeout);
    });
}

export default {

    namespace: 'room',

    state: {
        //登录->创建或加入->玩家列表->选座->设置->开始游戏
        client_id:'a2',
        username: "",
        //
        room_id: "1",
        room_name: '',
        owner_id: 'djsdka',
        //

        player_nick: {"a1": "lalal", "a2": "hahha", "a3": "ldldl", "a4": "ddddd"},
        player_avatar: {"a1": 'https://s3.amazonaws.com/uifaces/faces/twitter/brynn/128.jpg', "a2": 'https://s3.amazonaws.com/uifaces/faces/twitter/brynn/128.jpg', "a3": 'https://s3.amazonaws.com/uifaces/faces/twitter/brynn/128.jpg', "a4": 'https://s3.amazonaws.com/uifaces/faces/twitter/brynn/128.jpg'},
        player_num: 4,
        player_id: ["a1", "a2", "a3", "a4"],
        //
        //
        index_player:{1:"",2:"",3:"",4:""},
        player_index: {"a1": 1, "a2": 2, "a3": 3, "a4": 4},//玩家选位之后
        //
        index_id: ["a1", "a2", "a3", "a4"],//所有玩家选位之后

        Werewolf:4,
        Villager:4,
        Cupid:1,
        Seer:1,
        Witch:1,
        Hunter:1,
        Guard:1,
        WolfWinCondition:1,
        //上面七个是设置游戏的时候，以及玩的时候

        player_role: {"a1":"witch", "a2":"wolf", "a3":"cupid", "a4": "seer",},//房主开始游戏之后
        player_alive: {"a1": true, "a2": true, "a3": true, "a4": true,},//房主开始游戏之后

        lover_id1:"",
        lover_id2:"",



        guess_role: {},
        player_wolfvote: {},//根据狼人投票列表渲染
        list_wolfvote: {"a1":"a3", "a2": "a4"},//狼人投票列表
        sheriff_id: "a4",
        sheriff_list:[],
        player_selectedid:"",
        player_selectedid2:"",
        player_selectedid_wolf:"",
        wolf_lastkill:"",
        wolf_msg:[],
        round: 1,
        curstate: StateConst.cupid,
        laststate: StateConst.guard,

        room_request_id:'0',
        user_request_id:0,

        lastvote: {"a1": 'a3', "a2":'a4', "a3":'a4', "a4": 'a4'},
        nextstep: false,
        witch_save:false,
        witch_kill:false,



        hassocket:false,
        socket:null,
        loading : false,
        myseat:0,
        //玩家选座的时候

        role_alive: true
    },

    subscriptions: {},

    effects: {
        *WebSocketsend({ payload }, { put, call }) {
            //const WebSocket = yield select(state => state.socket);
            yield put({ type: 'showLoading' });
            yield call(delay, 2000);
            yield put({ type: 'checkLoading' });
        },
        //TODO:当夜晚对应角色死亡时，加一个计时函数，计时结束时调用发送下一步请求
    },

    reducers: {
        //WebSocket相关
        addstate(state)//TODO:临时写的，方便测试，需要删
        {
            return {...state, curstate: state.curstate + 1};
        },

        showLoading(state) {
            return {...state, loading: true};
        },
        hideLoading(state) {
            return {...state, loading: false};
        },
        checkLoading(state) {
            if(state.loading==true)
                Toast.offline('网络连接失败,请重试',1);
            return {...state, loading: false};
        },
        setsocket(state,action)
        {
            return{...state,socket:action.payload,hassocket:true};
        },
        addUserRequestID(state)
        {
            return{...state,user_request_id:state.user_request_id+1};
        },
        setRoomRequestID(state,action)
        {
            return{...state,room_request_id:action.payload};
        },
        setWolfMsg(state,action)
        {
            let m={key:state.wolf_msg.length,...action.payload};
            return{...state,wolf_msg:state.wolf_msg.push(m)};
        },
        setWolfVote(state,action)//设置狼人选人ID:ID对
        {
            let m={...state.list_wolfvote,[action.payload.wolf_id]:action.payload.object_id};
            let n={};
            for (let value of Object.values(m)) {
                let flag=false;
                for (let key of Object.keys(n))
                {
                    if(key==value)
                    {
                        n[key]++;
                        flag=true;
                    }
                }
                if(flag==false)
                {
                    n={...n,[value]:1};
                }
            }
            return{...state,list_wolfvote:m,player_wolfvote:n};
        },
        setLoverID(state,action)//TODO:在这里加情侣ID
        {
            return{...state,lover_id1:action.payload,lover_id2:action.payload};
        },

        changeselid(state,action)//这是点选Grid内内容后，切换当前选择玩家的reducer，丘比特因为要选两个人有特殊的判断
        {
            let selid1=state.player_selectedid;
            let selid2=state.player_selectedid2;
            if(state.curstate==StateConst.cupid)
            {
                if(state.player_selectedid2=="")
                    return{...state,player_selectedid2:action.payload};
                else if(state.player_selectedid=="")
                    return{...state,player_selectedid:action.payload};
                else if(action.payload==state.player_selectedid)
                    return{...state,player_selectedid:action.payload};
                else if(action.payload==state.player_selectedid2)
                    return{...state,player_selectedid2:action.payload};
                else
                    return{...state,player_selectedid2:action.payload,player_selectedid:selid2};
            }
            else
                return{...state,player_selectedid:action.payload};
        },
        changeselid_wolf(state)//这里是在狼人选人阶段，由于要利用通信，所以特殊处理
        {
            if(state.curstate==StateConst.wolf)
            {
                return{...state,player_selectedid:state.player_selectedid_wolf};
            }
            else
                return state;
        },
        setselid_wolf(state,action)//这里是在狼人选人阶段，暂存当前选人，等到服务器回复再调change处理
        {
            if(state.curstate==StateConst.wolf)
            {
                return{...state,player_selectedid_wolf:action.payload};
            }
            else
                return state;
        },
        setkillid_wolf(state,action)//这里是在狼人阶段，已经有狼人确认杀人以后，调用的reducer，目的是防止狼人杀不同的玩家
        {
            return{...state,wolf_lastkill:action.payload};
        },
        changeCharacterNum(state,action)
        {
            return {...state,};
        },
        setroomstate(state,action)
        {
            return{...state,curstate:action.payload};
        },
        setalive(state,action)
        {
            return{...state,player_alive:Object.assign(state.player_alive,action.payload)};
        },
        setsherifflist(state,action)
        {
            return{...state,sherifflist:action.payload};
        },
        setalastvote(state,action)
        {
            return{...state,lastvote:action.payload};
        },
        setsheriff(state,action)
        {
            //TODO:如果old不是当前警长
            if(action.payload[state.sheriff_id]=='-1')
                return{...state,sheriff_id:''};
            else
                return{...state,sheriff_id:action.payload[state.sheriff_id]};
        },



        changeNextStep(state,action) {
            return { ...state, nextstep: action.payload};
        },
        changeWitchSave(state,action) {
            return { ...state, nextstep: action.payload};
        },
        changeWitchKill(state,action) {
            return { ...state, nextstep: action.payload};
        },


        //以下三个是change添加的，用于修改loading
        //用于修改player_index,用于修改myseat
        //当服务端返回为true时，ws会调用第二个reducer
        changeloading(state,action)
        {
            return {...state,loading:action.payload};
        },
        changeplayerindex(state)
        {
            return {  ... state,player_index:Object.assign(state.player_index,{client_id:state.myseat})};
        },
        changemyseat(state,action)
        {
            return {...state,myseat:action.payload};
        },
        //
        setwolf(state,action)
        {
            console.log("ok");
            return {...state,Werewolf:action.payload};
        },
        setvill(state,action)
        {
            return {...state,Villager:action.payload};
        },
        setcupido(state,action)
        {
            return {...state,Cupid:action.payload};
        },
        setseer(state,action)
        {
            return {...state,Seer:action.payload};
        },
        setwitch(state,action)
        {
            return {...state,Witch:action.payload};
        },
        sethunter(state,action)
        {
            return {...state,Hunter:action.payload};
        },
        setguard(state,action)
        {
            return {...state,Guard:action.payload};
        },
        setwincondition(state,action)
        {
            return {...state,WolfWinCondition:action.payload}
        },

        //qingchanghan
        setuserinfo(state, action) {
            console.log("id: " + action.payload.userID);
            console.log("name: " + action.payload.username);
            return { ...state, client_id: action.payload.userID, username: action.payload.username};
        },
        createRoomSuccess(state, action) {
            return { ...state, room_id: action.payload.roomID, room_name: action.payload.roomName
                , owner_id: action.payload.ownerID};
        },
        addRoomSuccess(state, action) {
            return { ...state, room_id: action.payload.roomID, room_name: action.payload.roomName
                , owner_id: action.payload.ownerID};
        },
        setrolealive(state, action) {
            return { ...state, role_alive: action.payload};
        },


        //已经写了修改角色列表的东西，and已经做了设置playindex的东西

        setrolelist(state,action){
            return {...state,player_role:action.payload};
        },
        setplayerindex(state,action){
            let i = action.payload.u_id;

            return {...state,player_index:Object.assign(state.player_index,{i:action.payload.seat})};
        },
    }

};/**
 * Created by shi on 2016/11/3.
 */
