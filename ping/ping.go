package ping

import (
	"fmt"
	"log"
	"net"
	"os"
	"strconv"
	"sync"
	"time"
)

var (
	pingID uint64
	mutex  sync.Mutex
)

func init() {
	log.SetFlags(log.Lshortfile | log.LstdFlags)
}

func genCheckSum(msg []byte) uint16 {
	var chksum uint32 = 0
	if 0 != len(msg)%2 {
		msg = append(msg, 0)
	}
	for i := 0; i < len(msg); i += 2 {
		chksum += uint32(msg[i])<<8 + uint32(msg[i+1])
	}
	chksum = (chksum >> 16) + (chksum & 0xffff)
	chksum += (chksum >> 16)
	return uint16(^chksum)
}

func Ping(address string, timeout_msec time.Duration) bool {
	mutex.Lock()
	pingID++
	pingIDSend := pingID
	mutex.Unlock()

	conn, err := net.Dial("ip4:icmp", address)
	if err != nil {
		log.Println(err.Error())
		return false
	}
	defer conn.Close()

	pid := os.Getpid()
	msg := make([]byte, 512)

	//type
	msg[0] = 8
	//Code
	msg[1] = 0
	//checksum
	msg[2] = 0
	msg[3] = 0
	//identifer
	msg[4] = byte(pid >> 8)
	msg[5] = byte(pid & 0xff)
	//Sequence
	msg[6] = 0
	msg[7] = 0
	//data
	msg[8] = byte(pingIDSend >> 56)
	msg[9] = byte(pingIDSend >> 48)
	msg[10] = byte(pingIDSend >> 40)
	msg[11] = byte(pingIDSend >> 32)
	msg[12] = byte(pingIDSend >> 24)
	msg[13] = byte(pingIDSend >> 16)
	msg[14] = byte(pingIDSend >> 8)
	msg[15] = byte(pingIDSend & 0xff)
	len := 16

	chksum := genCheckSum(msg[0:len])
	msg[2] = byte(chksum >> 8)
	msg[3] = byte(chksum & 0xff)

	err = conn.SetDeadline(time.Now().Add(timeout_msec * time.Millisecond))
	if err != nil {
		log.Println(err.Error())
		return false
	}

	if _, err = conn.Write(msg[0:len]); err != nil {
		log.Println(err.Error())
		return false
	}

	recvLen := 0
	recvLen, err = conn.Read(msg[0:]) //注意:接收的数据包中前20个字节是IP头
	if err != nil {
		return false
	} else {
		//校验IP地址
		if srcIP, err := getSrcIPAddr(msg[0:recvLen]); err == nil {
			if srcIP == address {
				if true == checkPingReply(msg[0:recvLen], pid&0xffff, pingIDSend) {
					return true
				} else {
					return false
				}
			} else {
				return false
			}
		} else {
			return false
		}
	}
	return false
}

func getSrcIPAddr(msg []byte) (ip string, err error) {
	if len(msg) < 20 {
		err = fmt.Errorf("recv data len is less than 20")
	} else {
		ip += strconv.Itoa(int(msg[12])) + "." + strconv.Itoa(int(msg[13])) + "." + strconv.Itoa(int(msg[14])) + "." + strconv.Itoa(int(msg[15]))
	}
	return ip, err
}

func checkPingReply(msg []byte, pid int, pingIDSend uint64) bool {
	recvLen := len(msg)
	pidReply := int(msg[20+4])<<8 + int(msg[20+5])&0xff
	if pid == pidReply {
		var pingIDReply uint64
		for i := 20 + 8; i < recvLen; i++ {
			pingIDReply += uint64(msg[i]) << (8 * uint(recvLen-i-1))
		}
		if pingIDReply == pingIDSend {
			return true
		} else {
			log.Printf("pingID doesn't match, send: %d, recv: %d\n", pingIDSend, pingIDReply)
			return false
		}
	} else {
		log.Printf("pid doesn't match, send: %d, recv: %d\n", pid, pidReply)
		return false
	}
}
