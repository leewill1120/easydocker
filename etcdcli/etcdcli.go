package etcdcli

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strconv"
	"strings"
)

type Client struct {
	proto      string
	serverAddr string
	serverPort int
	urlPrefix  string
}

var (
	httpCli http.Client
)

func init() {
	httpCli = http.Client{}
}

func NewClient(pro, addr string, port int) *Client {
	cli := &Client{
		proto:      pro,
		serverAddr: addr,
		serverPort: port,
	}
	cli.urlPrefix = cli.proto + "://" + cli.serverAddr + ":" + strconv.Itoa(cli.serverPort) + "/v2/keys"
	return cli
}

func getValuesFromBuf(buf []byte) (interface{}, error) {
	var m map[string]interface{}
	if err := json.Unmarshal(buf, &m); err != nil {
		return nil, err
	} else {
		if _, exist := m["node"]; exist {
			m1 := m["node"].(map[string]interface{})
			if _, exist := m1["dir"]; exist {
				var list []string
				nodeList := m1["nodes"].([]interface{})
				for _, node := range nodeList {
					m2 := node.(map[string]interface{})
					fields := strings.Split(m2["key"].(string), "/")
					if _, exist := m2["dir"]; exist {
						list = append(list, fields[len(fields)-1]+"/")
					} else {
						list = append(list, fields[len(fields)-1])
					}
				}
				return list, nil
			} else {
				return m1["value"].(string), nil
			}
		} else {
			return nil, fmt.Errorf("no key \"node\"")
		}
	}
}

func (cli Client) Set(key, value string) error {
	body := strings.NewReader("value=" + value)

	if req, err := http.NewRequest("PUT", cli.urlPrefix+key, body); err != nil {
		return err
	} else {
		req.Header.Add("Content-Type", "application/x-www-form-urlencoded")
		if resp, err := httpCli.Do(req); err != nil {
			return err
		} else {
			defer resp.Body.Close()
			if 2 == resp.StatusCode/10/10 {
				return nil
			} else {
				return fmt.Errorf("Responose status code %d", resp.StatusCode)
			}
		}
	}
}

func (cli Client) Get(key string) (interface{}, error) {
	if resp, err := httpCli.Get(cli.urlPrefix + key); err != nil {
		return nil, err
	} else {
		defer resp.Body.Close()

		if 2 == resp.StatusCode/10/10 {
			var buf_final []byte
			for {
				buf := make([]byte, 512)
				n, err := resp.Body.Read(buf)
				if err == io.EOF {
					buf_final = append(buf_final, buf[0:n]...)
					break
				} else if err == nil {
					buf_final = append(buf_final, buf...)
				} else {
					return nil, err
				}
			}
			if ret, err := getValuesFromBuf(buf_final); err != nil {
				return nil, err
			} else {
				return ret, nil
			}
		} else {
			return nil, fmt.Errorf("Responose status code %d", resp.StatusCode)
		}
	}
}

func (cli Client) Rm(key string) error {
	if req, err := http.NewRequest("DELETE", cli.urlPrefix+key, nil); err != nil {
		return err
	} else {
		if resp, err := httpCli.Do(req); err != nil {
			return err
		} else {
			defer resp.Body.Close()

			if 2 == resp.StatusCode/10/10 {
				return nil
			} else {
				return fmt.Errorf("Responose status code %d", resp.StatusCode)
			}
		}
	}
}

func (cli Client) Mkdir(key string) error {
	if req, err := http.NewRequest("PUT", cli.urlPrefix+key+"?dir=true&prevExist=false", nil); err != nil {
		return nil
	} else {
		req.Header.Add("Content-Type", "application/x-www-form-urlencoded")

		if resp, err := httpCli.Do(req); err != nil {
			return err
		} else {
			defer resp.Body.Close()

			if 2 == resp.StatusCode/10/10 {
				return nil
			} else {
				return fmt.Errorf("Responose status code %d", resp.StatusCode)
			}
		}
	}
}

func (cli Client) Rmdir(key string) error {
	if req, err := http.NewRequest("DELETE", cli.urlPrefix+key+"?dir=true&recursive=true", nil); err != nil {
		return err
	} else {
		if resp, err := httpCli.Do(req); err != nil {
			return err
		} else {
			if 2 == resp.StatusCode/10/10 {
				return nil
			} else {
				return fmt.Errorf("Responose status code %d", resp.StatusCode)
			}
		}
	}
}
